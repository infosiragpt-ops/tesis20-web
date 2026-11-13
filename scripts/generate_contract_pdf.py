from __future__ import annotations

import json
import shutil
from pathlib import Path

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
CONTENT_PATH = ROOT / "src" / "data" / "contract-template.json"
OUTPUT_PATH = ROOT / "output" / "pdf" / "contrato-general-asesoria-academica-tesis20.pdf"
PUBLIC_PATH = ROOT / "public" / "downloads" / "contrato-general-asesoria-academica-tesis20.pdf"

YELLOW = colors.HexColor("#F5BD42")
INK = colors.HexColor("#1E2022")
MUTED = colors.HexColor("#5F6264")
LIGHT = colors.HexColor("#F5F3EE")
BORDER = colors.HexColor("#D8D5CE")


WHITE = colors.white

# Total de páginas y RUC que pinta el pie: build_pdf() los fija antes de dibujar.
PAGE_STATE = {"total": 2, "ruc": ""}


def provider_ruc(data):
    """RUC del prestador tal como figura en los datos de las partes."""
    for field in data["parties"][0]["fields"]:
        if field["label"].casefold() == "ruc":
            return field["value"]
    raise ValueError("El contrato no declara el RUC del prestador.")


def draw_page(canvas, doc):
    width, height = A4
    canvas.saveState()
    canvas.setFillColor(YELLOW)
    canvas.rect(0, height - 18 * mm, width, 18 * mm, fill=1, stroke=0)
    canvas.setFillColor(INK)
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawString(15 * mm, height - 11.5 * mm, "TESIS20")
    canvas.setFont("Helvetica", 7.5)
    canvas.drawRightString(width - 15 * mm, height - 11.5 * mm, "CONTRATO GENERAL DE ASESORÍA ACADÉMICA")

    canvas.setStrokeColor(YELLOW)
    canvas.setLineWidth(1.2)
    canvas.line(15 * mm, 15 * mm, width - 15 * mm, 15 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(
        15 * mm,
        9.5 * mm,
        f"Tesis20 · RUC {PAGE_STATE['ruc']} · Modelo general para Perú - completar antes de firmar",
    )
    canvas.drawRightString(width - 15 * mm, 9.5 * mm, f"Página {doc.page} de {PAGE_STATE['total']}")
    canvas.restoreState()


def clause_flowable(clause, styles):
    parts = [Paragraph(clause["title"], styles["ClauseTitle"])]
    for paragraph in clause["paragraphs"]:
        parts.append(Paragraph(paragraph, styles["BodySmall"]))
    parts.append(Spacer(1, 2.2 * mm))
    return KeepTogether(parts)


BLANK = "____________________"


def field_paragraph(field, styles):
    """«Etiqueta: valor»; sin valor queda la línea para completar a mano."""
    value = field["value"] or BLANK
    return Paragraph(f"<font color='#5F6264'><b>{field['label']}:</b></font> {value}", styles["Field"])


def fields_grid(title, fields, styles, *, status="", dark=False):
    """Tabla de dos columnas con barra de título: una por cada parte."""
    heading = f"<b>{title}</b>" + (f"&nbsp;&nbsp;·&nbsp;&nbsp;{status}" if status else "")
    rows = [[Paragraph(heading, styles["GridHeadDark" if dark else "GridHead"]), ""]]
    for index in range(0, len(fields), 2):
        right = field_paragraph(fields[index + 1], styles) if index + 1 < len(fields) else ""
        rows.append([field_paragraph(fields[index], styles), right])
    table = Table(rows, colWidths=[90 * mm, 90 * mm], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("SPAN", (0, 0), (-1, 0)),
                ("BACKGROUND", (0, 0), (-1, 0), INK if dark else YELLOW),
                ("BACKGROUND", (0, 1), (-1, -1), LIGHT),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
                ("INNERGRID", (0, 1), (-1, -1), 0.35, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3.4),
            ]
        )
    )
    return table


def build_story(data, styles):
    story = [
        Paragraph(data["title"].upper(), styles["DocTitle"]),
        Paragraph(data["version"], styles["Version"]),
        Paragraph(data["intro"], styles["BodySmall"]),
        Spacer(1, 1.2 * mm),
        fields_grid("CONTRATO", data["meta"], styles),
        Spacer(1, 1.2 * mm),
    ]
    for index, party in enumerate(data["parties"]):
        story.append(
            fields_grid(party["role"], party["fields"], styles, status=party["status"], dark=index == 0)
        )
        story.append(Spacer(1, 1.2 * mm))
    story.append(Spacer(1, 1.6 * mm))

    for clause in data["clauses"]:
        story.append(clause_flowable(clause, styles))

    signature_cells = []
    for signature in data["signatures"]:
        lines = [f"<b>{signature['role']}</b>", "", f"Firma: {BLANK}"]
        lines += [f"{field['label']}: {field['value'] or BLANK}" for field in signature["fields"]]
        signature_cells.append(Paragraph("<br/>".join(lines), styles["Field"]))
    signatures = Table([signature_cells], colWidths=[90 * mm, 90 * mm], hAlign="LEFT")
    signatures.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.6, BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.6, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )

    offices = data["offices"]
    office_cells = [
        Paragraph(f"<b>{office['city']}</b><br/>{office['address']}", styles["Tiny"])
        for office in offices["items"]
    ]
    office_table = Table([office_cells], colWidths=[60 * mm] * len(office_cells), hAlign="LEFT")
    office_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.35, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )

    legal_labels = "; ".join(source["label"] for source in data["legalSources"])
    story.append(
        KeepTogether(
            [
                Spacer(1, 1.2 * mm),
                signatures,
                Spacer(1, 2.4 * mm),
                Paragraph(offices["title"].upper(), styles["ClauseTitle"]),
                office_table,
                Spacer(1, 1 * mm),
                Paragraph(offices["note"], styles["Tiny"]),
                Spacer(1, 2 * mm),
                Paragraph(f"<b>Marco legal referencial:</b> {legal_labels}.", styles["Tiny"]),
                Spacer(1, 1.2 * mm),
                Paragraph(f"<b>Importante:</b> {data['notice']}", styles["Tiny"]),
            ]
        )
    )
    return story


def build_pdf():
    data = json.loads(CONTENT_PATH.read_text(encoding="utf-8"))
    PAGE_STATE["ruc"] = provider_ruc(data)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_PATH.parent.mkdir(parents=True, exist_ok=True)

    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="DocTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=16.5,
            alignment=TA_CENTER,
            textColor=INK,
            spaceAfter=2 * mm,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Version",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7.2,
            leading=9,
            alignment=TA_CENTER,
            textColor=MUTED,
            spaceAfter=3 * mm,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodySmall",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=7.75,
            leading=10,
            alignment=TA_LEFT,
            textColor=INK,
            spaceAfter=1.2 * mm,
        )
    )
    styles.add(
        ParagraphStyle(
            name="ClauseTitle",
            parent=styles["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=8.15,
            leading=10,
            textColor=INK,
            spaceAfter=1.1 * mm,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Field",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=7.4,
            leading=9.4,
            textColor=INK,
        )
    )
    styles.add(
        ParagraphStyle(
            name="GridHead",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=7.4,
            leading=9,
            textColor=INK,
        )
    )
    styles.add(
        ParagraphStyle(
            name="GridHeadDark",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=7.4,
            leading=9,
            textColor=WHITE,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Tiny",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=6.6,
            leading=8,
            textColor=MUTED,
        )
    )

    def render(path):
        frame = Frame(
            15 * mm,
            18 * mm,
            A4[0] - 30 * mm,
            A4[1] - 40 * mm,
            leftPadding=0,
            rightPadding=0,
            topPadding=0,
            bottomPadding=0,
            id="contract-frame",
        )
        doc = BaseDocTemplate(
            str(path),
            pagesize=A4,
            leftMargin=15 * mm,
            rightMargin=15 * mm,
            topMargin=22 * mm,
            bottomMargin=18 * mm,
            title=data["title"],
            author="Tesis20",
            subject="Modelo general de contrato de asesoría académica e investigación",
        )
        doc.addPageTemplates([PageTemplate(id="contract", frames=[frame], onPage=draw_page)])
        doc.build(build_story(data, styles))
        return len(PdfReader(str(path)).pages)

    # Primera pasada: cuenta las páginas. Segunda: el pie ya dice «Página X de N».
    page_count = render(OUTPUT_PATH)
    PAGE_STATE["total"] = page_count
    page_count = render(OUTPUT_PATH)
    if page_count != 2:
        raise RuntimeError(f"El contrato debe tener exactamente 2 páginas; se generaron {page_count}.")
    shutil.copy2(OUTPUT_PATH, PUBLIC_PATH)
    print(f"Generated: {OUTPUT_PATH}")
    print(f"Published: {PUBLIC_PATH}")
    print(f"Pages: {page_count}")


if __name__ == "__main__":
    build_pdf()

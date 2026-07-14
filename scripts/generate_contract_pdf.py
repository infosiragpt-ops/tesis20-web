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
    PageBreak,
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


class NumberedCanvasMixin:
    pass


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
    canvas.drawString(15 * mm, 9.5 * mm, "Modelo general para Perú - completar antes de firmar")
    canvas.drawRightString(width - 15 * mm, 9.5 * mm, f"Página {doc.page} de 2")
    canvas.restoreState()


def clause_flowable(clause, styles):
    parts = [Paragraph(clause["title"], styles["ClauseTitle"])]
    for paragraph in clause["paragraphs"]:
        parts.append(Paragraph(paragraph, styles["BodySmall"]))
    parts.append(Spacer(1, 2.2 * mm))
    return KeepTogether(parts)


def build_pdf():
    data = json.loads(CONTENT_PATH.read_text(encoding="utf-8"))
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
            name="Tiny",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=6.6,
            leading=8,
            textColor=MUTED,
        )
    )

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
        str(OUTPUT_PATH),
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

    story = [
        Paragraph(data["title"].upper(), styles["DocTitle"]),
        Paragraph(data["version"], styles["Version"]),
        Paragraph(data["intro"], styles["BodySmall"]),
        Spacer(1, 1.5 * mm),
    ]

    field_rows = []
    fields = data["fields"]
    for index in range(0, len(fields), 2):
        left = Paragraph(fields[index], styles["Tiny"])
        right = Paragraph(fields[index + 1] if index + 1 < len(fields) else "", styles["Tiny"])
        field_rows.append([left, right])
    field_table = Table(field_rows, colWidths=[89 * mm, 89 * mm], hAlign="LEFT")
    field_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.35, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.extend([field_table, Spacer(1, 3 * mm)])

    for clause in data["clauses"][:6]:
        story.append(clause_flowable(clause, styles))

    story.append(PageBreak())

    for clause in data["clauses"][6:]:
        story.append(clause_flowable(clause, styles))

    signature_data = []
    for signature in data["signatures"]:
        signature_data.append(Paragraph(signature.replace("\n", "<br/>"), styles["Tiny"]))
    signatures = Table([signature_data], colWidths=[89 * mm, 89 * mm], hAlign="LEFT")
    signatures.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.6, BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.6, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    legal_labels = "; ".join(source["label"] for source in data["legalSources"])
    story.extend(
        [
            Spacer(1, 1.5 * mm),
            signatures,
            Spacer(1, 2 * mm),
            Paragraph(f"<b>Marco legal referencial:</b> {legal_labels}.", styles["Tiny"]),
            Spacer(1, 1.2 * mm),
            Paragraph(f"<b>Importante:</b> {data['notice']}", styles["Tiny"]),
        ]
    )

    doc.build(story)
    page_count = len(PdfReader(str(OUTPUT_PATH)).pages)
    if page_count != 2:
        raise RuntimeError(f"El contrato debe tener exactamente 2 páginas; se generaron {page_count}.")
    shutil.copy2(OUTPUT_PATH, PUBLIC_PATH)
    print(f"Generated: {OUTPUT_PATH}")
    print(f"Published: {PUBLIC_PATH}")
    print(f"Pages: {page_count}")


if __name__ == "__main__":
    build_pdf()

from __future__ import annotations

import argparse
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
    Image,
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


def resolve_mark(explicit, declared):
    """Imagen de la firma o de la huella: la que se pasa por línea de comandos
    o, si el modelo la declara (ruta web bajo public/), esa. Sin ninguna, None."""
    if explicit:
        path = Path(explicit).expanduser()
    elif declared:
        path = ROOT / "public" / declared.lstrip("/")
    else:
        return None
    if not path.is_file():
        raise FileNotFoundError(f"No existe la imagen de firma o huella: {path}")
    if path.suffix.lower() != ".png":
        raise SystemExit(f"La firma y la huella deben ser PNG con fondo transparente (Word no admite WebP): {path}")
    return path


def require_private_output(signature, fingerprint, output):
    """Una firma o huella pasada por línea de comandos es para una copia privada:
    exige `--output` y que ese archivo quede fuera del repositorio, que es
    público. Así un descuido no deja la copia firmada en public/downloads ni en
    la carpeta del proyecto. (Publicarlas es otra vía: declararlas en el modelo.)"""
    if not (signature or fingerprint):
        return
    if not output:
        raise SystemExit(
            "--signature y --fingerprint exigen --output: la copia firmada no se publica en public/downloads."
        )
    if ROOT in Path(output).expanduser().resolve().parents:
        raise SystemExit(
            "--output debe quedar fuera de la carpeta del proyecto: la copia firmada no se guarda en el repositorio."
        )


def fitted_image(path, max_width, max_height):
    """Imagen escalada para caber en la caja sin deformarse (respeta la transparencia)."""
    image = Image(str(path), mask="auto")
    scale = min(max_width / image.imageWidth, max_height / image.imageHeight)
    image.drawWidth = image.imageWidth * scale
    image.drawHeight = image.imageHeight * scale
    return image


def signature_cell(signature, styles, signature_path=None, fingerprint_path=None):
    """Bloque de una parte: firma sobre su línea, recuadro de la huella al
    costado y, debajo, nombre y documento."""
    sign_width, print_width, height = 52 * mm, 18 * mm, 21 * mm
    marks = Table(
        [
            [
                fitted_image(signature_path, sign_width - 6 * mm, height - 1 * mm) if signature_path else "",
                fitted_image(fingerprint_path, print_width - 3 * mm, height - 3 * mm) if fingerprint_path else "",
            ],
            [Paragraph("FIRMA", styles["MarkCaption"]), Paragraph("HUELLA DIGITAL", styles["MarkCaption"])],
        ],
        colWidths=[sign_width, print_width],
        rowHeights=[height, None],
        hAlign="LEFT",
    )
    marks.setStyle(
        TableStyle(
            [
                ("LINEBELOW", (0, 0), (0, 0), 0.9, INK),
                ("BOX", (1, 0), (1, 0), 0.5, MUTED),
                ("ALIGN", (0, 0), (-1, 0), "CENTER"),
                ("VALIGN", (0, 0), (0, 0), "BOTTOM"),
                ("VALIGN", (1, 0), (1, 0), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 1.5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 1.5),
                ("TOPPADDING", (0, 0), (-1, 0), 1),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 0),
                ("TOPPADDING", (0, 1), (-1, 1), 1.5),
                ("BOTTOMPADDING", (0, 1), (-1, 1), 2.5),
            ]
        )
    )
    lines = [f"{field['label']}: {field['value'] or BLANK}" for field in signature["fields"]]
    return [
        Paragraph(f"<b>{signature['role']}</b>", styles["Field"]),
        Spacer(1, 1 * mm),
        marks,
        Paragraph("<br/>".join(lines), styles["Field"]),
    ]


def build_story(data, styles, marks=(None, None)):
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

    # Solo el prestador (primera parte) puede venir ya firmado.
    signature_cells = [
        signature_cell(signature, styles, *(marks if index == 0 else (None, None)))
        for index, signature in enumerate(data["signatures"])
    ]
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


def build_pdf(signature=None, fingerprint=None, output=None):
    """Genera el PDF del contrato.

    Sin argumentos publica el modelo en public/downloads (sin firmar, salvo que
    el propio modelo declare `signatureImage` / `fingerprintImage`). Con
    `output` escribe solo ese archivo: sirve para una copia ya firmada que se
    envía a un cliente y que no se publica en la web.
    """
    require_private_output(signature, fingerprint, output)
    data = json.loads(CONTENT_PATH.read_text(encoding="utf-8"))
    PAGE_STATE["ruc"] = provider_ruc(data)
    provider = data["signatures"][0]
    marks = (
        resolve_mark(signature, provider.get("signatureImage")),
        resolve_mark(fingerprint, provider.get("fingerprintImage")),
    )
    target = Path(output).expanduser() if output else OUTPUT_PATH
    target.parent.mkdir(parents=True, exist_ok=True)

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
            name="MarkCaption",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=5.6,
            leading=7,
            textColor=MUTED,
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
        doc.build(build_story(data, styles, marks))
        return len(PdfReader(str(path)).pages)

    # Primera pasada: cuenta las páginas. Segunda: el pie ya dice «Página X de N».
    page_count = render(target)
    PAGE_STATE["total"] = page_count
    page_count = render(target)
    if page_count != 2:
        raise RuntimeError(f"El contrato debe tener exactamente 2 páginas; se generaron {page_count}.")
    print(f"Generated: {target}")
    if not output:
        PUBLIC_PATH.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(target, PUBLIC_PATH)
        print(f"Published: {PUBLIC_PATH}")
    print(f"Pages: {page_count}")


def parse_args():
    parser = argparse.ArgumentParser(description="Genera el PDF del contrato de Tesis20.")
    parser.add_argument("--signature", help="PNG de la firma del prestador (fondo transparente).")
    parser.add_argument("--fingerprint", help="PNG de la huella digital del prestador.")
    parser.add_argument(
        "--output",
        help="Escribe solo este archivo y no toca public/downloads. Obligatorio con --signature o "
        "--fingerprint, y fuera de la carpeta del proyecto (la copia firmada es privada).",
    )
    return parser.parse_args()


if __name__ == "__main__":
    options = parse_args()
    build_pdf(options.signature, options.fingerprint, options.output)

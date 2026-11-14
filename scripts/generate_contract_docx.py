from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_ROW_HEIGHT_RULE, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.image.image import Image as DocxImage
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor, Twips


ROOT = Path(__file__).resolve().parents[1]
CONTENT_PATH = ROOT / "src" / "data" / "contract-template.json"
OUTPUT_PATH = ROOT / "output" / "docx" / "contrato-general-asesoria-academica-tesis20.docx"
PUBLIC_PATH = ROOT / "public" / "downloads" / "contrato-general-asesoria-academica-tesis20.docx"

YELLOW = "F5BD42"
INK = "1E2022"
MUTED = "5F6264"
LIGHT = "F5F3EE"
BORDER = "D8D5CE"
WHITE = "FFFFFF"

YELLOW_RGB = RGBColor(0xF5, 0xBD, 0x42)
INK_RGB = RGBColor(0x1E, 0x20, 0x22)
MUTED_RGB = RGBColor(0x5F, 0x62, 0x64)
WHITE_RGB = RGBColor(0xFF, 0xFF, 0xFF)

# El pie de página lleva el RUC: build_docx() carga aquí el contrato.
FOOTER_DATA = {}

BLANK = "____________________"

# Datos del servicio que se completan en Word además de los del contrato web.
SERVICE_FIELDS = [
    {"label": "Nombre del alumno", "value": ""},
    {"label": "Servicio contratado", "value": ""},
    {"label": "Monto total (S/)", "value": ""},
    {"label": "Fechas (inicio y término)", "value": ""},
]


def set_run_font(run, *, size=10, bold=False, color=INK_RGB, name="Calibri"):
    run.bold = bold
    run.font.size = Pt(size)
    run.font.color.rgb = color
    run.font.name = name
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.get_or_add_rFonts()
    rfonts.set(qn("w:ascii"), name)
    rfonts.set(qn("w:hAnsi"), name)
    rfonts.set(qn("w:cs"), name)


def set_paragraph_spacing(paragraph, *, before=0, after=6, line=240, align=None):
    paragraph.paragraph_format.space_before = Pt(before)
    paragraph.paragraph_format.space_after = Pt(after)
    paragraph.paragraph_format.line_spacing_rule = WD_LINE_SPACING.EXACTLY
    paragraph.paragraph_format.line_spacing = Twips(line)
    if align is not None:
        paragraph.alignment = align


def shade_cell(cell, hex_color):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_color)
    tc_pr.append(shd)


def set_cell_borders(cell, color=BORDER, size="4"):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_borders = OxmlElement("w:tcBorders")
    for edge in ("top", "left", "bottom", "right"):
        border = OxmlElement(f"w:{edge}")
        border.set(qn("w:val"), "single")
        border.set(qn("w:sz"), size)
        border.set(qn("w:space"), "0")
        border.set(qn("w:color"), color)
        tc_borders.append(border)
    tc_pr.append(tc_borders)


def set_cell_margins(cell, *, top=60, bottom=60, left=80, right=80):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = OxmlElement("w:tcMar")
    for name, value in (("top", top), ("left", left), ("bottom", bottom), ("right", right)):
        node = OxmlElement(f"w:{name}")
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")
        tc_mar.append(node)
    tc_pr.append(tc_mar)


def set_cell_edges(cell, *, top=None, left=None, bottom=None, right=None, color=BORDER):
    """Bordes por lado, en octavos de punto; None = sin borde en ese lado."""
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_borders = OxmlElement("w:tcBorders")
    for edge, size in (("top", top), ("left", left), ("bottom", bottom), ("right", right)):
        border = OxmlElement(f"w:{edge}")
        border.set(qn("w:val"), "single" if size else "nil")
        if size:
            border.set(qn("w:sz"), str(size))
            border.set(qn("w:space"), "0")
            border.set(qn("w:color"), color)
        tc_borders.append(border)
    tc_pr.append(tc_borders)


def prevent_row_split(row):
    tr_pr = row._tr.get_or_add_trPr()
    cant_split = OxmlElement("w:cantSplit")
    tr_pr.append(cant_split)


def set_table_fixed(table, width_cm):
    table.autofit = False
    table.allow_autofit = False
    tbl = table._tbl
    tbl_pr = tbl.tblPr if tbl.tblPr is not None else OxmlElement("w:tblPr")
    tbl_w = OxmlElement("w:tblW")
    tbl_w.set(qn("w:w"), str(int(width_cm * 567)))
    tbl_w.set(qn("w:type"), "dxa")
    tbl_pr.append(tbl_w)


def add_bottom_border(paragraph, color=INK, size="12"):
    p_pr = paragraph._p.get_or_add_pPr()
    p_bdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), size)
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), color)
    p_bdr.append(bottom)
    p_pr.append(p_bdr)


def add_fill_in_run(paragraph, placeholder=""):
    """Underline an empty span so the party can type over it in Word."""
    run = paragraph.add_run(placeholder or BLANK)
    set_run_font(run, size=10, color=INK_RGB)
    run.underline = True
    rpr = run._element.get_or_add_rPr()
    u = rpr.find(qn("w:u"))
    if u is None:
        u = OxmlElement("w:u")
        rpr.append(u)
    u.set(qn("w:val"), "single")
    u.set(qn("w:color"), INK)


def split_labeled_value(raw):
    if ": " not in raw:
        return raw, ""
    label, value = raw.split(": ", 1)
    return label.strip(), value.strip()


def is_blank_value(value):
    stripped = value.replace("_", "").replace(" ", "")
    return stripped == ""


def write_cell_text(cell, text, *, size=9, bold=False, color=INK_RGB, align=WD_ALIGN_PARAGRAPH.LEFT):
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    paragraph = cell.paragraphs[0]
    paragraph.clear()
    set_paragraph_spacing(paragraph, before=0, after=0, line=220, align=align)
    run = paragraph.add_run(text)
    set_run_font(run, size=size, bold=bold, color=color)
    return paragraph


def add_labeled_fill_cell(cell, label, value=""):
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    set_cell_margins(cell, top=70, bottom=70, left=90, right=90)
    shade_cell(cell, LIGHT)
    set_cell_borders(cell)

    paragraph = cell.paragraphs[0]
    paragraph.clear()
    set_paragraph_spacing(paragraph, before=0, after=0, line=230)
    label_run = paragraph.add_run(f"{label}: ")
    set_run_font(label_run, size=9, bold=True, color=MUTED_RGB)

    if value and not is_blank_value(value):
        value_run = paragraph.add_run(value)
        set_run_font(value_run, size=10, color=INK_RGB)
    else:
        add_fill_in_run(paragraph)


def add_header_bar(section):
    header = section.header
    header.is_linked_to_previous = False
    paragraph = header.paragraphs[0]
    paragraph.clear()
    set_paragraph_spacing(paragraph, before=0, after=0, line=200)

    table = header.add_table(rows=1, cols=2, width=Cm(18.0))
    set_table_fixed(table, 18.0)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.columns[0].width = Cm(6.0)
    table.columns[1].width = Cm(12.0)
    prevent_row_split(table.rows[0])

    left, right = table.rows[0].cells
    for cell in (left, right):
        shade_cell(cell, YELLOW)
        set_cell_borders(cell, YELLOW, "0")
        set_cell_margins(cell, top=80, bottom=80, left=100, right=100)

    left_p = write_cell_text(left, "TESIS20", size=12, bold=True, color=INK_RGB)
    left_p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    right_p = write_cell_text(
        right,
        "CONTRATO GENERAL DE ASESORÍA ACADÉMICA",
        size=8,
        bold=True,
        color=INK_RGB,
        align=WD_ALIGN_PARAGRAPH.RIGHT,
    )
    right_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT

    spacer = header.add_paragraph()
    set_paragraph_spacing(spacer, before=0, after=0, line=80)


def add_footer_bar(section):
    footer = section.footer
    footer.is_linked_to_previous = False
    paragraph = footer.paragraphs[0]
    paragraph.clear()
    set_paragraph_spacing(paragraph, before=4, after=0, line=200)
    add_bottom_border(paragraph, YELLOW, "16")

    brand = paragraph.add_run(
        f"TESIS20  ·  RUC {provider_ruc(FOOTER_DATA)}  ·  Modelo general para Perú — completar antes de firmar"
    )
    set_run_font(brand, size=8, bold=False, color=MUTED_RGB)

    page_run = paragraph.add_run("          Página ")
    set_run_font(page_run, size=8, color=MUTED_RGB)
    add_page_field(paragraph)
    of_run = paragraph.add_run(" de ")
    set_run_font(of_run, size=8, color=MUTED_RGB)
    add_num_pages_field(paragraph)


def add_page_field(paragraph):
    run = paragraph.add_run()
    set_run_font(run, size=8, color=MUTED_RGB)
    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")
    run._r.append(fld_begin)
    run._r.append(instr)
    run._r.append(fld_end)


def add_num_pages_field(paragraph):
    run = paragraph.add_run()
    set_run_font(run, size=8, color=MUTED_RGB)
    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " NUMPAGES "
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")
    run._r.append(fld_begin)
    run._r.append(instr)
    run._r.append(fld_end)


def add_heading_block(document, data):
    title = document.add_paragraph()
    set_paragraph_spacing(title, before=6, after=4, line=320, align=WD_ALIGN_PARAGRAPH.CENTER)
    run = title.add_run(data["title"].upper())
    set_run_font(run, size=15, bold=True, color=INK_RGB)

    version = document.add_paragraph()
    set_paragraph_spacing(version, before=0, after=10, line=220, align=WD_ALIGN_PARAGRAPH.CENTER)
    run = version.add_run(data["version"])
    set_run_font(run, size=9, bold=True, color=MUTED_RGB)

    intro = document.add_paragraph()
    set_paragraph_spacing(intro, before=0, after=12, line=240)
    run = intro.add_run(data["intro"])
    set_run_font(run, size=10.5, color=INK_RGB)


def add_section_label(document, text):
    paragraph = document.add_paragraph()
    paragraph.paragraph_format.keep_with_next = True
    set_paragraph_spacing(paragraph, before=4, after=6, line=240)
    run = paragraph.add_run(text.upper())
    set_run_font(run, size=10, bold=True, color=INK_RGB)


def provider_ruc(data):
    """RUC del prestador tal como figura en los datos de las partes."""
    for field in data["parties"][0]["fields"]:
        if field["label"].casefold() == "ruc":
            return field["value"]
    raise ValueError("El contrato no declara el RUC del prestador.")


def add_fields_grid(document, title, fields, *, status="", dark=False):
    """Tabla de dos columnas con una barra de título: una por cada parte."""
    rows = (len(fields) + 1) // 2
    table = document.add_table(rows=rows + 1, cols=2)
    set_table_fixed(table, 18.0)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.columns[0].width = Cm(9.0)
    table.columns[1].width = Cm(9.0)

    header_row = table.rows[0]
    prevent_row_split(header_row)
    header = header_row.cells[0].merge(header_row.cells[1])
    fill = INK if dark else YELLOW
    shade_cell(header, fill)
    set_cell_borders(header, fill, "4")
    set_cell_margins(header, top=70, bottom=70, left=110, right=110)
    paragraph = write_cell_text(
        header, title, size=10, bold=True, color=YELLOW_RGB if dark else INK_RGB
    )
    if status:
        status_run = paragraph.add_run(f"   ·   {status}")
        set_run_font(status_run, size=9, color=WHITE_RGB if dark else INK_RGB)

    for index in range(rows * 2):
        cell = table.rows[index // 2 + 1].cells[index % 2]
        prevent_row_split(table.rows[index // 2 + 1])
        if index >= len(fields):
            shade_cell(cell, LIGHT)
            set_cell_borders(cell)
            write_cell_text(cell, "")
            continue
        field = fields[index]
        add_labeled_fill_cell(cell, field["label"], field["value"])

    spacer = document.add_paragraph()
    set_paragraph_spacing(spacer, before=0, after=0, line=120)


def add_parties(document, data):
    add_section_label(document, "Datos de las partes")
    hint = document.add_paragraph()
    hint.paragraph_format.keep_with_next = True
    set_paragraph_spacing(hint, before=0, after=8, line=220)
    run = hint.add_run(
        "Los datos de Tesis20 ya están completos. Completa en Word los espacios "
        "subrayados: tus datos, universidad, servicio, monto, fechas y firmas."
    )
    set_run_font(run, size=9, color=MUTED_RGB)

    add_fields_grid(document, "CONTRATO", data["meta"])
    for index, party in enumerate(data["parties"]):
        add_fields_grid(
            document, party["role"], party["fields"], status=party["status"], dark=index == 0
        )
    add_fields_grid(document, "DATOS DEL SERVICIO", SERVICE_FIELDS)


def add_clauses(document, clauses):
    add_section_label(document, "Cláusulas")
    for clause in clauses:
        title = document.add_paragraph()
        title.paragraph_format.keep_with_next = True
        set_paragraph_spacing(title, before=8, after=3, line=240)
        run = title.add_run(clause["title"])
        set_run_font(run, size=11, bold=True, color=INK_RGB)

        for text in clause["paragraphs"]:
            paragraph = document.add_paragraph()
            set_paragraph_spacing(paragraph, before=0, after=6, line=240)
            add_text_with_blanks(paragraph, text)


def add_text_with_blanks(paragraph, text):
    """Keep clause blanks underlined so they stay editable in Word."""
    pieces = []
    buffer = ""
    index = 0
    while index < len(text):
        if text[index] == "_":
            if buffer:
                pieces.append(("text", buffer))
                buffer = ""
            underscores = 0
            while index < len(text) and text[index] == "_":
                underscores += 1
                index += 1
            pieces.append(("blank", "_" * max(underscores, 12)))
        else:
            buffer += text[index]
            index += 1
    if buffer:
        pieces.append(("text", buffer))

    if not pieces:
        run = paragraph.add_run(text)
        set_run_font(run, size=10.5, color=INK_RGB)
        return

    for kind, value in pieces:
        if kind == "blank":
            add_fill_in_run(paragraph, value)
        else:
            run = paragraph.add_run(value)
            set_run_font(run, size=10.5, color=INK_RGB)


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


def add_marks_table(cell, signature_path, fingerprint_path):
    """Dentro de la celda de una parte: espacio de la firma sobre su línea y,
    al costado, el recuadro de la huella digital, con sus rótulos debajo."""
    table = cell.add_table(rows=2, cols=2)
    table.autofit = False
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    widths = (Cm(5.6), Cm(2.4))
    for column, width in zip(table.columns, widths):
        column.width = width

    marks_row, captions_row = table.rows
    marks_row.height = Cm(2.7)
    marks_row.height_rule = WD_ROW_HEIGHT_RULE.AT_LEAST
    prevent_row_split(marks_row)

    sign_cell, print_cell = marks_row.cells
    for target, width in ((sign_cell, widths[0]), (print_cell, widths[1])):
        target.width = width
        set_cell_margins(target, top=40, bottom=20, left=60, right=60)
    set_cell_edges(sign_cell, bottom=12, color=INK)
    sign_cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.BOTTOM
    set_cell_edges(print_cell, top=6, left=6, bottom=6, right=6, color=MUTED)
    print_cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER

    # Cada imagen se ajusta por su lado limitante, para que una firma apaisada
    # no se salga de la celda. Las cajas descuentan los márgenes de la celda y
    # el que LibreOffice añade a las imágenes en línea (3,2 mm por lado).
    for target, image, max_width, max_height in (
        (sign_cell, signature_path, Cm(4.7), Cm(2.5)),
        (print_cell, fingerprint_path, Cm(1.52), Cm(2.3)),
    ):
        paragraph = target.paragraphs[0]
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        paragraph.paragraph_format.space_before = Pt(0)
        paragraph.paragraph_format.space_after = Pt(0)
        if image:
            native = DocxImage.from_file(str(image))
            if native.width / native.height > max_width / max_height:
                paragraph.add_run().add_picture(str(image), width=max_width)
            else:
                paragraph.add_run().add_picture(str(image), height=max_height)

    for target, width, caption in zip(captions_row.cells, widths, ("Firma", "Huella digital")):
        target.width = width
        set_cell_edges(target)
        set_cell_margins(target, top=40, bottom=0, left=60, right=60)
        write_cell_text(target, caption.upper(), size=7.5, bold=True, color=MUTED_RGB)


def add_signatures(document, signatures, marks):
    add_section_label(document, "Firmas")
    hint = document.add_paragraph()
    hint.paragraph_format.keep_with_next = True
    set_paragraph_spacing(hint, before=0, after=8, line=220)
    run = hint.add_run(
        "Cada parte firma sobre la línea, pone su huella digital en el recuadro y completa su "
        "nombre y documento de identidad."
    )
    set_run_font(run, size=9, color=MUTED_RGB)

    table = document.add_table(rows=1, cols=2)
    set_table_fixed(table, 18.0)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.columns[0].width = Cm(9.0)
    table.columns[1].width = Cm(9.0)
    prevent_row_split(table.rows[0])

    for index, (cell, signature) in enumerate(zip(table.rows[0].cells, signatures)):
        shade_cell(cell, WHITE)
        set_cell_borders(cell, BORDER, "8")
        set_cell_margins(cell, top=120, bottom=140, left=120, right=120)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP

        first = cell.paragraphs[0]
        first.clear()
        set_paragraph_spacing(first, before=0, after=4, line=240)
        heading = first.add_run(signature["role"])
        set_run_font(heading, size=11, bold=True, color=INK_RGB)

        # Solo el prestador (primera parte) puede venir ya firmado.
        signature_path, fingerprint_path = marks if index == 0 else (None, None)
        add_marks_table(cell, signature_path, fingerprint_path)
        # Word deja un párrafo vacío tras la tabla anidada: se reduce al mínimo.
        set_paragraph_spacing(cell.paragraphs[-1], before=0, after=0, line=80)

        for line in signature["fields"]:
            paragraph = cell.add_paragraph()
            set_paragraph_spacing(paragraph, before=6, after=8, line=260)
            label_run = paragraph.add_run(f"{line['label']}: ")
            set_run_font(label_run, size=10, bold=True, color=MUTED_RGB)
            if line["value"] and not is_blank_value(line["value"]):
                value_run = paragraph.add_run(line["value"])
                set_run_font(value_run, size=10, bold=True, color=INK_RGB)
            else:
                add_fill_in_run(paragraph, BLANK)
            add_bottom_border(paragraph, BORDER, "8")


def add_offices(document, offices):
    spacer = document.add_paragraph()
    set_paragraph_spacing(spacer, before=6, after=0, line=160)
    add_section_label(document, offices["title"])

    items = offices["items"]
    table = document.add_table(rows=1, cols=len(items))
    set_table_fixed(table, 18.0)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    prevent_row_split(table.rows[0])
    for column in table.columns:
        column.width = Cm(18.0 / len(items))

    for cell, office in zip(table.rows[0].cells, items):
        shade_cell(cell, LIGHT)
        set_cell_borders(cell)
        set_cell_margins(cell, top=90, bottom=90, left=110, right=110)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
        cell.width = Cm(18.0 / len(items))
        city = cell.paragraphs[0]
        city.clear()
        set_paragraph_spacing(city, before=0, after=2, line=230)
        set_run_font(city.add_run(office["city"]), size=10, bold=True, color=INK_RGB)
        address = cell.add_paragraph()
        set_paragraph_spacing(address, before=0, after=0, line=220)
        set_run_font(address.add_run(office["address"]), size=9, color=MUTED_RGB)

    note = document.add_paragraph()
    set_paragraph_spacing(note, before=6, after=0, line=220)
    set_run_font(note.add_run(offices["note"]), size=9, color=MUTED_RGB)


def add_notice(document, data):
    spacer = document.add_paragraph()
    set_paragraph_spacing(spacer, before=10, after=0, line=160)

    legal_labels = "; ".join(source["label"] for source in data["legalSources"])
    legal = document.add_paragraph()
    set_paragraph_spacing(legal, before=8, after=6, line=220)
    bold = legal.add_run("Marco legal referencial: ")
    set_run_font(bold, size=9, bold=True, color=INK_RGB)
    rest = legal.add_run(f"{legal_labels}.")
    set_run_font(rest, size=9, color=MUTED_RGB)

    table = document.add_table(rows=1, cols=1)
    set_table_fixed(table, 18.0)
    cell = table.rows[0].cells[0]
    shade_cell(cell, LIGHT)
    set_cell_borders(cell, YELLOW, "12")
    set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
    paragraph = cell.paragraphs[0]
    paragraph.clear()
    set_paragraph_spacing(paragraph, before=0, after=0, line=230)
    label = paragraph.add_run("Importante: ")
    set_run_font(label, size=9.5, bold=True, color=INK_RGB)
    notice = paragraph.add_run(data["notice"])
    set_run_font(notice, size=9.5, color=INK_RGB)


def build_docx(signature=None, fingerprint=None, output=None):
    """Genera el Word del contrato.

    Sin argumentos publica el modelo en public/downloads (sin firmar, salvo que
    el propio modelo declare `signatureImage` / `fingerprintImage`). Con
    `output` escribe solo ese archivo: sirve para una copia ya firmada que se
    envía a un cliente y que no se publica en la web.
    """
    require_private_output(signature, fingerprint, output)
    data = json.loads(CONTENT_PATH.read_text(encoding="utf-8"))
    FOOTER_DATA.update(data)
    provider = data["signatures"][0]
    marks = (
        resolve_mark(signature, provider.get("signatureImage")),
        resolve_mark(fingerprint, provider.get("fingerprintImage")),
    )
    target = Path(output).expanduser() if output else OUTPUT_PATH
    target.parent.mkdir(parents=True, exist_ok=True)

    document = Document()
    document.core_properties.author = "Tesis20"
    document.core_properties.title = data["title"]
    document.core_properties.subject = "Modelo general de contrato de asesoría académica e investigación"
    document.core_properties.category = "Contrato"
    document.core_properties.language = "es-PE"

    section = document.sections[0]
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    section.left_margin = Cm(1.5)
    section.right_margin = Cm(1.5)
    section.top_margin = Cm(2.4)
    section.bottom_margin = Cm(2.0)
    section.header_distance = Cm(0.4)
    section.footer_distance = Cm(0.6)

    style = document.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(11)
    style.font.color.rgb = INK_RGB

    add_header_bar(section)
    add_footer_bar(section)
    add_heading_block(document, data)
    add_parties(document, data)
    add_clauses(document, data["clauses"])
    add_signatures(document, data["signatures"], marks)
    add_offices(document, data["offices"])
    add_notice(document, data)

    document.save(target)
    print(f"Generated: {target}")
    if not output:
        PUBLIC_PATH.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(target, PUBLIC_PATH)
        print(f"Published: {PUBLIC_PATH}")


def parse_args():
    parser = argparse.ArgumentParser(description="Genera el Word del contrato de Tesis20.")
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
    build_docx(options.signature, options.fingerprint, options.output)

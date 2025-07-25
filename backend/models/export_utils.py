from fpdf import FPDF
from docx import Document
import os
import uuid

def export_to_pdf(text):
    filename = f"{uuid.uuid4().hex}.pdf"
    filepath = os.path.join("exports", filename)
    os.makedirs("exports", exist_ok=True)
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    for line in text.splitlines():
        pdf.multi_cell(0, 10, line)
    pdf.output(filepath)
    return f"exports/{filename}"

def export_to_word(text):
    filename = f"{uuid.uuid4().hex}.docx"
    filepath = os.path.join("exports", filename)
    os.makedirs("exports", exist_ok=True)
    doc = Document()
    for line in text.splitlines():
        doc.add_paragraph(line)
    doc.save(filepath)
    return f"exports/{filename}"
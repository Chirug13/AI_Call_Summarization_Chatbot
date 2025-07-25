from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import shutil
import os
import uuid
from fpdf import FPDF
from models.whisper_model import transcribe_audio
from models.llm_responder import query_ollama

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "./uploads"
LOG_DIR = "./logs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

app.mount("/logs", StaticFiles(directory=LOG_DIR), name="logs")

class ChatRequest(BaseModel):
    prompt: str
    context: str = ""

@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    audio_id = uuid.uuid4().hex
    audio_path = os.path.join(UPLOAD_DIR, f"{audio_id}_{audio.filename}")
    print(f"[MIC DEBUG] Received audio file: {audio.filename}")

    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)

    transcription = transcribe_audio(audio_path)

    if not transcription.strip():
        print(f"[MIC WARNING] No transcription detected from file: {audio.filename}")
        transcription = "[No voice detected in the audio.]"

    with open(os.path.join(LOG_DIR, f"{audio_id}.txt"), "w", encoding="utf-8") as log_file:
        log_file.write(transcription)

    return {
        "transcription": transcription,
        "log_id": audio_id
    }

@app.post("/chat")
async def chat(request: ChatRequest):
    prompt = f"{request.prompt.strip()}\n\nContext:\n{request.context.strip()}"
    response = query_ollama(prompt=prompt)
    return {"response": response}

@app.post("/export/pdf")
async def export_pdf(request: ChatRequest):
    context = request.context or request.prompt
    summary = query_ollama(prompt=f"Summarize this:\n{context}")

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="AI Call Summary", ln=True, align="C")
    pdf.multi_cell(0, 10, f"Summary:\n{summary}")

    pdf_filename = f"summary_{uuid.uuid4().hex}.pdf"
    pdf_file_path = os.path.join(LOG_DIR, pdf_filename)
    pdf.output(pdf_file_path)

    return {"file": f"/logs/{pdf_filename}"}

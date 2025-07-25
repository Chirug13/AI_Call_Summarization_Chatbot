# AI Call Summarization Chatbot

An AI-powered voice assistant that transcribes, analyzes, and summarizes customer service calls in real-time. Built with a modern stack — **Whisper** for speech-to-text, **Mistral/Command-R** for summarization and insights, and **Coqui** for text-to-speech — this solution provides a seamless experience for agents and auditors.

---

## Features

- Upload or record audio (WAV/MP3)
- Transcribe using **Whisper** (local/offline or API-based)
- Summarize calls and extract key points using **Mistral** or **Command-R** LLMs
- Tone analysis (satisfied / unsatisfied / neutral)
- View summaries, call metadata, and agent response quality
- Export transcripts and summaries to **PDF/Word**
- Auto-record ➜ transcribe ➜ summarize ➜ playback in loop
- Clean dashboard UI built with **React** (or Streamlit/Gradio option)

---
<img width="3828" height="2150" alt="image" src="https://github.com/user-attachments/assets/b8988889-66b0-4068-beee-8f38f07bc1cd" />

## Models & Tools Used

| Component           | Model/Tool              | Purpose                              |
|--------------------|--------------------------|--------------------------------------|
| Speech-to-Text  | [`Whisper`](https://github.com/openai/whisper)       | Audio transcription                  |
| Language Model   | [`Mistral`](https://mistral.ai/) via Ollama or [`Command-R`](https://huggingface.co) | Call summarization, sentiment        |
| TTS              | [`Coqui TTS`](https://github.com/coqui-ai/TTS)       | Convert summary text to voice        |
| UI Dashboard     | React        | Interactive interface                 |
| PDF/Doc Export   | Python-docx / ReportLab  | Exporting chat logs and summaries     |

---

## Benefits for Banking & Enterprise

- **Improves call center efficiency** by reducing manual note-taking
- **AI-driven sentiment analysis** helps flag negative customer experiences
- **Regulatory-ready summaries** for auditing and documentation
- **Fully local option** for data-sensitive deployments (air-gapped laptops/servers)
- Easily extendable with agent scoring, FAQs, and CRM integration

---

## Project Structure

AI_Call_Summarization_Chatbot/
├── app.py / main.py # Backend (FastAPI / Flask)
├── components/ # Audio recorder, transcriber, summarizer
├── frontend/ # React / Streamlit UI
├── models/ # Whisper, Mistral/Command-R, Coqui
├── static/ # Waveform, audio previews, UI assets
├── requirements.txt
├── README.md


Copy
Edit

---

## Installation

```bash
git clone https://github.com/Chirug13/AI_Call_Summarization_Chatbot.git
cd AI_Call_Summarization_Chatbot
Create & activate a virtual environment:
bash
Copy
Edit
python -m venv venv
venv\Scripts\activate      # Windows
# or
source venv/bin/activate   # Mac/Linux
Install dependencies:
bash
Copy
Edit
pip install -r requirements.txt
Make sure you have installed Whisper + Coqui + Mistral/Ollama locally

▶Running the App
For Streamlit/Gradio frontend:
bash
Copy
Edit
streamlit run app.py
For React + FastAPI setup:
bash
Copy
Edit
# Backend
uvicorn main:app --reload

# Frontend (if React)
cd frontend/
npm install
npm start

Example Prompts
"Summarize this call in 3 key bullet points"

"What was the customer's main concern?"

"Was the customer satisfied or not?"

"Generate a delegation note based on this call"

License
MIT License — feel free to use, modify, and deploy in your organization.

Author
Chiru
Santosh Kumar

import whisper
import torch

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"[INFO] Using device: {device.upper()}")

# Ensure you are using a GPU-accelerated Whisper
model = whisper.load_model("small", device=device)

def transcribe_audio(file_path):
    result = model.transcribe(file_path)
    return result["text"]

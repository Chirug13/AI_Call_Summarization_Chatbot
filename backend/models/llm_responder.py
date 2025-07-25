import requests
import os

# Set your local Ollama endpoint (adjust port if needed)
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")

def query_ollama(prompt: str) -> str:
    try:
        payload = {
            "model": "mistral",
            "prompt": prompt,
            "stream": False
        }

        response = requests.post(OLLAMA_URL, json=payload, timeout=60)

        if response.status_code == 200:
            json_data = response.json()
            return json_data.get("response", "").strip() or "No response from model."
        else:
            return f"Model returned HTTP {response.status_code}: {response.text}"

    except requests.exceptions.Timeout:
        return "Request timed out. Mistral may be processing a large prompt or busy."
    except requests.exceptions.ConnectionError:
        return "Could not connect to the Ollama server. Is it running?"
    except Exception as e:
        return f"Unexpected error: {str(e)}"

from pathlib import Path
from uuid import uuid4

from flask import current_app
from gtts import gTTS


def generate_speech(text, language):
    if not current_app.config.get("ENABLE_TTS", True):
        raise RuntimeError("Text-to-speech is disabled.")

    output_dir = Path(current_app.config["UPLOAD_DIR"]) / "audio"
    output_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid4().hex}.mp3"
    output_path = output_dir / filename

    # gTTS requires internet access.
    gTTS(text=text, lang=language).save(str(output_path))

    return f"/uploads/audio/{filename}"

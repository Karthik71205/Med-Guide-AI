import re
from pathlib import Path

from PIL import Image, ImageOps
import pytesseract

from flask import current_app


def _configure_tesseract():
    command = current_app.config.get("TESSERACT_CMD")
    if command:
        pytesseract.pytesseract.tesseract_cmd = command


def preprocess_image(image: Image.Image) -> Image.Image:
    image = ImageOps.exif_transpose(image)
    image = image.convert("L")

    # Keep preprocessing deliberately simple and stable for a hackathon.
    image = ImageOps.autocontrast(image)

    # Upscaling improves OCR on small medicine-strip text.
    width, height = image.size
    if width < 1200:
        scale = 1200 / max(width, 1)
        image = image.resize((int(width * scale), int(height * scale)))

    return image


def extract_text(file_path: str) -> str:
    _configure_tesseract()

    image = Image.open(file_path)
    image = preprocess_image(image)

    text = pytesseract.image_to_string(image, config="--psm 6")
    return clean_ocr_text(text)


def clean_ocr_text(text: str) -> str:
    lines = []
    for line in text.splitlines():
        line = re.sub(r"\s+", " ", line).strip()
        if line:
            lines.append(line)
    return "\n".join(lines)

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "development-secret-change-me")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "development-jwt-secret-change-me")

    MONGO_URI = os.getenv("MONGO_URI", "")
    MONGO_DB = os.getenv("MONGO_DB", "medguide_ai")

    UPLOAD_DIR = str(BASE_DIR / os.getenv("UPLOAD_DIR", "uploads"))
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH_MB", "10")) * 1024 * 1024

    TESSERACT_CMD = os.getenv("TESSERACT_CMD", "").strip()
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.5")
    ENABLE_TTS = os.getenv("ENABLE_TTS", "true").lower() == "true"

    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

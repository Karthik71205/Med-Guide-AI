from pathlib import Path
from uuid import uuid4

from bson import ObjectId
from flask import Blueprint, current_app, request, send_from_directory

from ..extensions import get_db
from ..services.language_service import translate
from ..services.medicine_service import find_medicine, get_medicine_by_slug, seed_medicines
from ..services.ocr_service import extract_text
from ..services.personalization_service import analyze_medicine_for_profile
from ..services.speech_service import generate_speech
from ..utils.decorators import current_user_id, protected_route
from ..utils.responses import error, success

medicine_bp = Blueprint("medicine", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}


def _get_profile(db):
    return db.health_profiles.find_one(
        {"user_id": ObjectId(current_user_id())},
        {"_id": 0, "user_id": 0}
    )


def _allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


@medicine_bp.post("/seed")
@protected_route
def seed():
    db = get_db()
    if db is None:
        return error("MongoDB is not configured.", 503)

    count = seed_medicines(db)
    return success({"count": count}, "Prototype medicine data seeded.")


@medicine_bp.post("/recognize")
@protected_route
def recognize():
    payload = request.get_json(silent=True) or {}
    text = payload.get("text", "").strip()

    if not text:
        return error("text is required.")

    medicine, score = find_medicine(text, get_db())

    if not medicine:
        return error(
            "Medicine could not be confidently recognized.",
            404,
            {"ocr_text": text}
        )

    return success({
        "medicine": medicine,
        "match_score": score,
        "ocr_text": text
    }, "Medicine recognized.")


@medicine_bp.get("/<slug>")
@protected_route
def medicine_info(slug):
    medicine = get_medicine_by_slug(slug, get_db())

    if not medicine:
        return error("Medicine not found.", 404)

    return success(medicine, "Medicine information retrieved.")


@medicine_bp.post("/analyze")
@protected_route
def analyze():
    payload = request.get_json(silent=True) or {}
    medicine_name = payload.get("medicine_name", "").strip()

    if not medicine_name:
        return error("medicine_name is required.")

    db = get_db()
    if db is None:
        return error("MongoDB is not configured.", 503)

    profile = _get_profile(db)
    if not profile:
        return error("Create a health profile before personalized analysis.", 400)

    medicine, score = find_medicine(medicine_name, db)
    if not medicine:
        return error("Medicine not found.", 404)

    analysis = analyze_medicine_for_profile(medicine, profile)
    analysis["match_score"] = score

    db.medicine_history.insert_one({
        "user_id": ObjectId(current_user_id()),
        "medicine_slug": medicine["slug"],
        "medicine_name": medicine["name"],
        "match_score": score,
        "source": "manual_or_recognized",
    })

    return success(analysis, "Personalized medicine analysis generated.")


@medicine_bp.post("/scan")
@protected_route
def scan():
    if "image" not in request.files:
        return error("Upload an image using the 'image' field.")

    file = request.files["image"]

    if not file.filename:
        return error("The uploaded file has no filename.")

    if not _allowed_file(file.filename):
        return error("Unsupported image type. Use PNG, JPG, JPEG, or WEBP.")

    filename = f"{uuid4().hex}.{file.filename.rsplit('.', 1)[1].lower()}"
    upload_dir = Path(current_app.config["UPLOAD_DIR"])
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / filename
    file.save(file_path)

    try:
        ocr_text = extract_text(str(file_path))
    except Exception as exc:
        file_path.unlink(missing_ok=True)
        return error(
            "OCR processing failed. Check that Tesseract OCR is installed.",
            500,
            {"reason": str(exc)}
        )

    medicine, score = find_medicine(ocr_text, get_db())

    response = {
        "ocr_text": ocr_text,
        "recognized": bool(medicine),
        "match_score": score,
    }

    if medicine:
        response["medicine"] = medicine
        response["next_step"] = "Call POST /api/medicines/analyze with medicine_name."
    else:
        response["next_step"] = "Ask the user to enter the medicine name manually."

    return success(response, "Medicine image processed.")


@medicine_bp.post("/translate")
@protected_route
def medicine_translate():
    payload = request.get_json(silent=True) or {}
    text = payload.get("text", "").strip()
    language = payload.get("target_language", "").strip().lower()

    if not text or not language:
        return error("text and target_language are required.")

    try:
        translated = translate(text, language)
    except ValueError as exc:
        return error(str(exc))

    return success({
        "source_language": "en",
        "target_language": language,
        "text": translated
    }, "Text translated.")


@medicine_bp.post("/speak")
@protected_route
def speak():
    payload = request.get_json(silent=True) or {}
    text = payload.get("text", "").strip()
    language = payload.get("language", "en").strip().lower()

    if not text:
        return error("text is required.")

    try:
        audio_url = generate_speech(text, language)
    except Exception as exc:
        return error(
            "Text-to-speech could not be generated. Ensure TTS is enabled and internet access is available.",
            503,
            {"reason": str(exc)}
        )

    return success({
        "audio_url": audio_url,
        "language": language
    }, "Speech generated.")

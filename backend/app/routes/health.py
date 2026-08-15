from datetime import datetime
from pathlib import Path
from uuid import uuid4

from bson import ObjectId
from flask import Blueprint, current_app, request

from ..extensions import get_db
from ..services.ocr_service import extract_text
from ..utils.decorators import current_user_id, protected_route
from ..utils.responses import error, success

health_bp = Blueprint("health", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}


def _allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def _extract_report_hints(text):
    """
    Lightweight prototype parser.
    It is intentionally conservative: it only extracts obvious labels and
    condition keywords. It does not diagnose a patient.
    """
    lower = text.lower()

    condition_map = {
        "diabetes": ["diabetes", "diabetic", "hba1c", "blood sugar"],
        "hypertension": ["hypertension", "high blood pressure"],
        "thyroid": ["thyroid", "tsh", "hypothyroid"],
        "cardiovascular": ["cardiac", "cardiovascular", "heart disease"],
        "renal": ["renal", "kidney disease", "creatinine"],
        "liver": ["liver disease", "hepatic", "sgot", "sgpt"],
    }

    detected = []
    for condition, keywords in condition_map.items():
        if any(keyword in lower for keyword in keywords):
            detected.append(condition)

    return {
        "detected_condition_keywords": sorted(set(detected))
    }


@health_bp.get("/health")
def health():
    return success({
        "service": "medguide-ai-backend",
        "status": "ok",
        "version": "prototype-1.1"
    })


@health_bp.post("/health/reports/scan")
@protected_route
def scan_report():
    if "image" not in request.files:
        return error("Upload an image using the 'image' field.")

    file = request.files["image"]

    if not file.filename:
        return error("The uploaded file has no filename.")

    if not _allowed_file(file.filename):
        return error("Unsupported image type. Use PNG, JPG, JPEG, or WEBP.")

    filename = f"{uuid4().hex}.{file.filename.rsplit('.', 1)[1].lower()}"
    upload_dir = Path(current_app.config["UPLOAD_DIR"]) / "reports"
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / filename
    file.save(file_path)

    try:
        extracted_text = extract_text(str(file_path))
    except Exception as exc:
        file_path.unlink(missing_ok=True)
        return error(
            "Diagnostic report OCR failed. Check that Tesseract OCR is installed.",
            500,
            {"reason": str(exc)}
        )

    hints = _extract_report_hints(extracted_text)

    db = get_db()
    if db is not None:
        db.report_scans.insert_one({
            "user_id": ObjectId(current_user_id()),
            "ocr_text": extracted_text,
            "detected_hints": hints,
            "created_at": datetime.utcnow(),
        })

    return success({
        "ocr_text": extracted_text,
        "hints": hints,
        "message": (
            "Review these OCR hints before saving them to the health profile. "
            "The prototype does not diagnose conditions from a report."
        )
    }, "Diagnostic report processed.")


@health_bp.get("/health/history")
@protected_route
def history():
    db = get_db()

    if db is None:
        return error("MongoDB is not configured.", 503)

    profile = db.health_profiles.find_one(
        {"user_id": ObjectId(current_user_id())},
        {"_id": 0, "user_id": 0}
    )

    medicines = list(db.medicine_history.find(
        {"user_id": ObjectId(current_user_id())},
        {"_id": 0, "user_id": 0}
    ).sort("_id", -1).limit(20))

    reports = list(db.report_scans.find(
        {"user_id": ObjectId(current_user_id())},
        {"_id": 0, "user_id": 0}
    ).sort("_id", -1).limit(10))

    return success({
        "profile": profile or {},
        "medicine_history": medicines,
        "report_history": reports,
    }, "Personalized health history retrieved.")

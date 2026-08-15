from bson import ObjectId
from flask import Blueprint, request

from ..extensions import get_db
from ..utils.decorators import current_user_id, protected_route
from ..utils.responses import error, success

profile_bp = Blueprint("profile", __name__)

VALID_CONDITIONS = {
    "diabetes",
    "hypertension",
    "thyroid",
    "cardiovascular",
    "renal",
    "liver",
}

VALID_LANGUAGES = {"en", "te", "hi"}


@profile_bp.get("")
@protected_route
def get_profile():
    db = get_db()
    if db is None:
        return error("MongoDB is not configured.", 503)

    profile = db.health_profiles.find_one(
        {"user_id": ObjectId(current_user_id())},
        {"_id": 0}
    )

    return success(profile or {}, "Profile retrieved.")


@profile_bp.put("")
@protected_route
def upsert_profile():
    payload = request.get_json(silent=True) or {}

    conditions = [
        str(item).strip().lower()
        for item in payload.get("conditions", [])
        if str(item).strip()
    ]

    unknown_conditions = sorted(set(conditions) - VALID_CONDITIONS)
    if unknown_conditions:
        return error(
            "Unsupported health condition(s).",
            details={"allowed": sorted(VALID_CONDITIONS)}
        )

    preferred_language = payload.get("preferred_language", "en")
    if preferred_language not in VALID_LANGUAGES:
        return error("preferred_language must be en, te, or hi.")

    age = payload.get("age")
    weight = payload.get("weight_kg")

    if age is not None and (not isinstance(age, int) or not 0 < age < 130):
        return error("age must be an integer between 1 and 129.")

    if weight is not None and (not isinstance(weight, (int, float)) or not 1 < weight < 500):
        return error("weight_kg must be between 1 and 500.")

    profile = {
        "user_id": ObjectId(current_user_id()),
        "age": age,
        "sex": payload.get("sex"),
        "weight_kg": weight,
        "conditions": conditions,
        "preferred_language": preferred_language,
        "updated_at": __import__("datetime").datetime.utcnow(),
    }

    db = get_db()
    if db is None:
        return error("MongoDB is not configured.", 503)

    db.health_profiles.update_one(
        {"user_id": ObjectId(current_user_id())},
        {"$set": profile},
        upsert=True
    )

    profile.pop("user_id", None)
    return success(profile, "Health profile saved.")

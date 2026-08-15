from datetime import datetime
from uuid import uuid4

from bson import ObjectId
from flask import Blueprint, request

from ..extensions import get_db
from ..utils.decorators import current_user_id, protected_route
from ..utils.responses import error, success

actions_bp = Blueprint("actions", __name__)


def _create_demo_action(action_type, payload):
    db = get_db()

    action = {
        "action_id": uuid4().hex,
        "user_id": ObjectId(current_user_id()),
        "action_type": action_type,
        "status": "demo_requested",
        "payload": payload,
        "created_at": datetime.utcnow(),
    }

    if db is not None:
        db.monetization_actions.insert_one(action)

    action.pop("_id", None)
    action["user_id"] = str(action["user_id"])
    action["created_at"] = action["created_at"].isoformat()

    return action


@actions_bp.post("/consult-doctor")
@protected_route
def consult_doctor():
    payload = request.get_json(silent=True) or {}
    specialty = payload.get("specialty", "General Physician")

    action = _create_demo_action(
        "doctor_consultation",
        {"specialty": specialty}
    )

    return success(
        action,
        "Doctor consultation request created for prototype demonstration.",
        201
    )


@actions_bp.post("/book-test")
@protected_route
def book_test():
    payload = request.get_json(silent=True) or {}
    test_name = payload.get("test_name", "").strip()

    if not test_name:
        return error("test_name is required.")

    action = _create_demo_action(
        "diagnostic_test_booking",
        {"test_name": test_name}
    )

    return success(
        action,
        "Diagnostic test booking request created for prototype demonstration.",
        201
    )


@actions_bp.post("/order-medicine")
@protected_route
def order_medicine():
    payload = request.get_json(silent=True) or {}
    medicine_name = payload.get("medicine_name", "").strip()

    if not medicine_name:
        return error("medicine_name is required.")

    action = _create_demo_action(
        "pharmacy_order",
        {"medicine_name": medicine_name}
    )

    return success(
        action,
        "Pharmacy order request created for prototype demonstration.",
        201
    )

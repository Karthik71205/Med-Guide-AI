from flask import Blueprint, request
from flask_jwt_extended import create_access_token

from ..extensions import get_db
from ..services.auth_service import check_password, hash_password, serialize_user
from ..utils.responses import error, success

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    payload = request.get_json(silent=True) or {}

    name = payload.get("name", "").strip()
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")

    if not name or not email or not password:
        return error("name, email, and password are required.")

    if len(password) < 8:
        return error("Password must contain at least 8 characters.")

    db = get_db()

    if db is None:
        return error("MongoDB is not configured. Set MONGO_URI in .env.", 503)

    if db.users.find_one({"email": email}):
        return error("An account with this email already exists.", 409)

    user = {
        "name": name,
        "email": email,
        "password_hash": hash_password(password),
    }

    result = db.users.insert_one(user)
    user["_id"] = result.inserted_id

    return success(serialize_user(user), "Registration successful.", 201)


@auth_bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}

    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")

    if not email or not password:
        return error("email and password are required.")

    db = get_db()

    if db is None:
        return error("MongoDB is not configured. Set MONGO_URI in .env.", 503)

    user = db.users.find_one({"email": email})

    if not user or not check_password(password, user["password_hash"]):
        return error("Invalid email or password.", 401)

    token = create_access_token(identity=str(user["_id"]))

    return success({
        "token": token,
        "user": serialize_user(user)
    }, "Login successful.")

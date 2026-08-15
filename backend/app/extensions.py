from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient

mongo_client = None
mongo_db = None

jwt = JWTManager()


def init_extensions(app):
    global mongo_client, mongo_db

    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    if app.config["MONGO_URI"]:
        mongo_client = MongoClient(app.config["MONGO_URI"], serverSelectionTimeoutMS=5000)
        mongo_db = mongo_client[app.config["MONGO_DB"]]
    else:
        # A tiny in-memory fallback makes UI development possible without MongoDB.
        # For the hackathon demo, MongoDB is recommended.
        mongo_db = None


def get_db():
    return mongo_db

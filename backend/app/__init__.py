from pathlib import Path

from flask import Flask

from .config import Config
from .extensions import init_extensions
from .routes import register_routes


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    Path(app.config["UPLOAD_DIR"]).mkdir(parents=True, exist_ok=True)

    init_extensions(app)
    register_routes(app)

    return app

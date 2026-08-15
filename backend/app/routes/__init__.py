from .auth import auth_bp
from .health import health_bp
from .actions import actions_bp
from .medicine import medicine_bp
from .profile import profile_bp


def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")
    app.register_blueprint(medicine_bp, url_prefix="/api/medicines")
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(actions_bp, url_prefix="/api/actions")

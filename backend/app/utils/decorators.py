from functools import wraps

from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request


def protected_route(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        return fn(*args, **kwargs)

    return wrapper


def current_user_id():
    return get_jwt_identity()

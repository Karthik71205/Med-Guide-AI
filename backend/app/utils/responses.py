from flask import jsonify


def success(data=None, message="Success", status=200):
    return jsonify({
        "success": True,
        "message": message,
        "data": data
    }), status


def error(message, status=400, details=None):
    body = {
        "success": False,
        "message": message
    }
    if details:
        body["details"] = details
    return jsonify(body), status

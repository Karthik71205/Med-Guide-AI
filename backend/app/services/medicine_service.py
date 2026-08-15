import json
import re
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parents[2] / "data" / "medicines.json"


def load_medicines():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def seed_medicines(db):
    if db is None:
        return 0

    medicines = load_medicines()
    collection = db["medicines"]

    for medicine in medicines:
        collection.update_one(
            {"slug": medicine["slug"]},
            {"$set": medicine},
            upsert=True
        )

    return len(medicines)


def normalize_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return " ".join(text.split())


def _score_match(query, medicine):
    normalized_query = normalize_text(query)
    tokens = set(normalized_query.split())

    candidates = {
        normalize_text(medicine["name"]),
        normalize_text(medicine["generic_name"]),
        normalize_text(medicine["brand_name"]),
    }

    score = 0
    for candidate in candidates:
        candidate_tokens = set(candidate.split())
        if candidate in normalized_query:
            score = max(score, 100)
        else:
            score = max(score, len(tokens & candidate_tokens) * 25)

    for alias in medicine.get("aliases", []):
        alias_normalized = normalize_text(alias)
        if alias_normalized in normalized_query:
            score = max(score, 90)

    return score


def find_medicine(query, db=None):
    if db is not None:
        medicines = list(db["medicines"].find({}, {"_id": 0}))
    else:
        medicines = load_medicines()

    scored = [
        (medicine, _score_match(query, medicine))
        for medicine in medicines
    ]
    scored.sort(key=lambda item: item[1], reverse=True)

    if not scored or scored[0][1] < 25:
        return None, 0

    return scored[0][0], scored[0][1]


def get_medicine_by_slug(slug, db=None):
    if db is not None:
        return db["medicines"].find_one({"slug": slug}, {"_id": 0})

    for medicine in load_medicines():
        if medicine["slug"] == slug:
            return medicine

    return None

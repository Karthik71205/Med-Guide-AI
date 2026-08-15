from app import create_app
from app.extensions import get_db
from app.services.medicine_service import seed_medicines

app = create_app()

with app.app_context():
    db = get_db()
    seed_medicines(db)
    print("Prototype medicine data seeded successfully.")

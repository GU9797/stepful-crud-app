from app import app, db
from models import Person

# Ensure Flask app context is active
with app.app_context():
    # Create sample persons
    persons = [
        Person(name="Bryan Cranston", phone_number="123-456-7890", role="coach"),
        Person(name="Aaron Paul", phone_number="987-654-3210", role="student"),
        Person(name="Dean Norris", phone_number="555-666-7777", role="coach"),
        Person(name="RJ Mitte", phone_number="222-333-4444", role="student"),
    ]

    # Add persons to session and commit to database
    db.session.add_all(persons)
    db.session.commit()

    print("Sample persons added")

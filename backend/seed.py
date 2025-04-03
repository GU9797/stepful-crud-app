# === Import app and models ===
from app import app, db  # Import the Flask app and database instance
from models import Person  # Import the Person model

# === Activate Flask app context ===
with app.app_context():
    # Create sample Person entries (coaches and students)
    persons = [
        # Person(name="Bryan Cranston", phone_number="123-456-7890", role="coach"),
        # Person(name="Aaron Paul", phone_number="987-654-3210", role="student"),
        # Person(name="Dean Norris", phone_number="555-666-7777", role="coach"),
        # Person(name="RJ Mitte", phone_number="222-333-4444", role="student"),
        Person(name="Anna Gunn", phone_number="555-666-7777", role="coach"),
        Person(name="Betsy Brandt", phone_number="222-333-4444", role="student"),
    ]

    # Add all Person objects to the session
    db.session.add_all(persons)

    # Commit the session to write to the database
    db.session.commit()

    # Confirmation message
    print("Sample persons added")

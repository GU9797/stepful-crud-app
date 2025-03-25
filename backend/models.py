# === Imports ===
from config import SQLALCHEMY_DATABASE_URI
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# === Flask App and DB Setup ===
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI  # Set database connection URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False  # Disable tracking to reduce overhead

db = SQLAlchemy(app)  # Initialize SQLAlchemy with Flask app

# === Models ===

# Person model represents both coaches and students
class Person(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Unique identifier
    name = db.Column(db.String(100), nullable=False)  # Full name
    phone_number = db.Column(db.String(20), nullable=False)  # Contact number
    role = db.Column(db.String(10), nullable=False)  # Either 'coach' or 'student'

# Slot model represents availability or booked time slots
class Slot(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Unique slot ID
    coach_id = db.Column(db.Integer, db.ForeignKey("person.id"), nullable=False)  # Coach offering the slot
    date = db.Column(db.Date, nullable=False)  # Date of the slot
    time_start = db.Column(db.Time, nullable=False)  # Start time
    time_end = db.Column(db.Time, nullable=False)  # End time
    booked_by = db.Column(db.Integer, db.ForeignKey("person.id"), nullable=True)  # Student who booked (nullable)
    rating = db.Column(db.Integer, nullable=True)  # Satisfaction rating (optional)
    notes = db.Column(db.Text, nullable=True)  # Feedback notes (optional)

# === Create Tables in DB (Only when run directly) ===
with app.app_context():
    db.create_all()  # Create all tables defined above if they don't exist

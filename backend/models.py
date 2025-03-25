from config import SQLALCHEMY_DATABASE_URI
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


# Person Model (Coaches & Students)
class Person(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    role = db.Column(db.String(10), nullable=False)  # "coach" or "student"


# Availability Slot Model
class Slot(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    coach_id = db.Column(db.Integer, db.ForeignKey("person.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time_start = db.Column(db.Time, nullable=False)
    time_end = db.Column(db.Time, nullable=False)
    booked_by = db.Column(
        db.Integer, db.ForeignKey("person.id"), nullable=True
    )  # Student ID
    rating = db.Column(db.Integer, nullable=True)
    notes = db.Column(db.Text, nullable=True)


with app.app_context():
    db.create_all()

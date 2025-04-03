# === Imports ===
from config import SQLALCHEMY_DATABASE_URI
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Person, Slot
from datetime import datetime, date
from sqlalchemy import or_, and_

# === Initialize Flask App ===
app = Flask(__name__)

# Enable CORS for frontend on localhost:3000
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Configure database connection
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
db.init_app(app)

# === Helper Function ===
def filter_overlapping_slots(coach_id, student_id, slots):
    """
    Filters out available slots that overlap with any globally booked slots.
    Returns a list of valid (non-overlapping) available + booked slots.
    """
    all_booked_slots = Slot.query.filter(
        or_(
            Slot.coach_id == coach_id,
            Slot.booked_by == student_id
        ),
        Slot.booked_by != None  # Ensures it's actually booked
    ).all()

    booked_slots = [slot for slot in slots if slot.booked_by]
    available_slots = [slot for slot in slots if not slot.booked_by]

    def slot_datetime_range(slot):
        start = datetime.combine(slot.date, slot.time_start)
        end = datetime.combine(slot.date, slot.time_end)
        return start, end

    filtered_available_slots = []
    for available in available_slots:
        a_start, a_end = slot_datetime_range(available)

        overlaps = any(
            a_start < b_end and a_end > b_start
            for b in all_booked_slots
            for b_start, b_end in [slot_datetime_range(b)]
        )

        if not overlaps:
            filtered_available_slots.append(available)

    return booked_slots + filtered_available_slots

# === API Endpoints ===

# Coaches create availability slots
@app.route("/slots/add", methods=["POST"])
def add_slot():
    data = request.json
    slot = Slot(
        coach_id=data["coach_id"],
        date=datetime.strptime(data["date"], "%Y-%m-%d").date(),
        time_start=data["time_start"],
        time_end=data["time_end"],
    )
    db.session.add(slot)
    db.session.commit()
    return jsonify({"message": "Slot added"}), 201

# Get slots filtered by coach and/or student
@app.route("/slots", methods=["GET"])
def get_slots():
    coach_id = request.args.get("coach_id", type=int)
    student_id = request.args.get("student_id", type=int)

    query = Slot.query

    # Case: Only student is selected – fetch their booked slots
    if student_id and not coach_id:
        query = query.filter(Slot.booked_by == student_id)

    # Case: Coach selected – get their offered slots
    if coach_id:
        query = query.filter(Slot.coach_id == coach_id)

        # If student is also selected, return:
        # - available slots with this coach
        # - slots booked by this student with this coach
        if student_id:
            query = query.filter(
                or_(Slot.booked_by == None, Slot.booked_by == student_id)
            )

    # Filter out past slots (student view only)
    if student_id:
        query = query.filter(Slot.date >= date.today())

    slots = query.all()

    # For students: remove any available slots that conflict with booked ones
    if student_id:
        slots = filter_overlapping_slots(coach_id, student_id, slots)

    # Format response
    result = []
    for slot in slots:
        coach = Person.query.get(slot.coach_id)
        student = Person.query.get(slot.booked_by) if slot.booked_by else None

        result.append({
            "id": slot.id,
            "start": f"{slot.date}T{slot.time_start}",
            "end": f"{slot.date}T{slot.time_end}",
            "coach_id": coach.id,
            "coach_name": coach.name,
            "coach_phone": coach.phone_number,
            "student_id": slot.booked_by,
            "student_name": student.name if student else None,
            "student_phone": student.phone_number if student else None,
            "rating": slot.rating,
            "notes": slot.notes,
        })

    return jsonify(result)

# Students book a slot
@app.route("/slots/book/<int:slot_id>", methods=["PUT"])
def book_slot(slot_id):
    data = request.json
    slot = Slot.query.get(slot_id)
    if slot and not slot.booked_by:
        slot.booked_by = data["student_id"]
        db.session.commit()
        return jsonify({"message": "Slot booked"})
    return jsonify({"error": "Slot unavailable"}), 400

# Coaches submit feedback after a session
@app.route("/slots/feedback/<int:slot_id>", methods=["POST"])
def add_feedback(slot_id):
    data = request.json
    slot = Slot.query.get(slot_id)
    if slot:
        slot.rating = data["rating"]
        slot.notes = data["notes"]
        db.session.commit()
    return jsonify({"message": "Feedback recorded"}), 201

# Get all persons (students & coaches)
@app.route("/persons", methods=["GET"])
def get_persons():
    persons = Person.query.all()
    person_list = [
        {"id": person.id, "name": person.name, "role": person.role}
        for person in persons
    ]
    return jsonify(person_list)

# === Run App ===
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

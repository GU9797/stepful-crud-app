import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import axios from "axios";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

import BookingDetailsDialog from "dashboard/components/BookingDetailsDialog";

/**
 * CalendarView
 * Displays a calendar interface for booking and managing availability slots.
 * Adjusts behavior based on the current mode ("student" or "coach").
 */
export default function CalendarView({ mode, selectedCoach, selectedStudent }) {
  // Calendar state
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog state
  const [bookingDialog, setBookingDialog] = useState({ open: false, slot: null });
  const [viewDialog, setViewDialog] = useState({ open: false, slot: null });
  const [creatingSlot, setCreatingSlot] = useState({ open: false, slot: null });

  // Feedback state (used by coaches)
  const [feedback, setFeedback] = useState({ rating: "", notes: "" });

  /**
   * Fetch slots from the backend based on current coach and student selections.
   * Filters, transforms, and colors slots depending on booking status and mode.
   */
  const fetchSlots = () => {
    if (!selectedStudent?.id && !selectedCoach?.id) {
      setEvents([]);
      return;
    }

    const params = {};
    if (selectedCoach?.id) params.coach_id = selectedCoach.id;
    if (selectedStudent?.id) params.student_id = selectedStudent.id;

    setLoading(true);
    axios
      .get("http://localhost:5000/slots", { params })
      .then(res => {
        const formatted = res.data.map(slot => ({
          id: slot.id,
          title: slot.student_id
            ? `Booked Slot (${mode === "coach" ? slot.student_name : slot.coach_name})`
            : `Available Slot (${slot.coach_name})`,
          start: slot.start,
          end: slot.end,
          backgroundColor: slot.student_id ? "#2196F3" : "#4CAF50",
          borderColor: slot.student_id ? "#1976D2" : "#388E3C",
          extendedProps: { ...slot, isBooked: !!slot.student_id }
        }));
        setEvents(formatted);
      })
      .finally(() => setLoading(false));
  };

  // Refetch slots whenever selection changes
  useEffect(() => {
    fetchSlots();
  }, [selectedCoach, selectedStudent]);

  /**
   * Handle clicking on a calendar event.
   * Book or view slot depending on mode and booking status.
   */
  const handleEventClick = (info) => {
    const slot = info.event;
    const { isBooked } = slot.extendedProps;

    if (isBooked) {
      if (mode === "student") {
        setViewDialog({ open: true, slot, role: "student" });
      } else if (mode === "coach") {
        setFeedback({
          rating: slot.extendedProps.rating || "",
          notes: slot.extendedProps.notes || "",
        });
        setViewDialog({ open: true, slot, role: "coach" });
      }
    } else if (mode === "student") {
      if (!selectedStudent) return alert("Select a student first.");
      setBookingDialog({ open: true, slot });
    }
  };

  /**
   * Handle clicking on a date cell to create a new availability slot.
   * Checks for overlapping or invalid slots.
   */
  const handleDateClick = (arg) => {
    if (!selectedCoach) return alert("Please select a coach first.");

    const startTime = arg.date;
    const endTime = dayjs(startTime).add(2, "hour").toDate();

    // Disallow overlapping with other slots
    const isOverlapping = events.some((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return startTime < eventEnd && endTime > eventStart;
    });
    if (isOverlapping) return alert("Overlapping with existing slot");

    // Disallow slots that run past 9 PM
    const slotMaxTime = dayjs(startTime).hour(21).minute(0).second(0);
    if (dayjs(endTime).isAfter(slotMaxTime)) {
      return alert("Slot must end before 9:00 PM");
    }

    setCreatingSlot({ open: true, slot: { start: startTime, end: endTime } });
  };

  /**
   * Book a slot by assigning it to the selected student.
   */
  const handleBookSlot = () => {
    axios.put(`http://localhost:5000/slots/book/${bookingDialog.slot.id}`, {
      student_id: selectedStudent.id,
    })
    .then(() => {
      setBookingDialog({ open: false, slot: null });
      fetchSlots();
    })
    .catch(() => alert("Failed to book slot."));
  };

  /**
   * Create a new availability slot for the selected coach.
   */
  const handleCreateSlot = () => {
    const { start, end } = creatingSlot.slot;
    axios.post("http://localhost:5000/slots/add", {
      coach_id: selectedCoach.id,
      date: dayjs(start).format("YYYY-MM-DD"),
      time_start: dayjs(start).format("HH:mm:ss"),
      time_end: dayjs(end).format("HH:mm:ss"),
    })
    .then(() => {
      setCreatingSlot({ open: false, slot: null });
      fetchSlots();
    })
    .catch((err) => {
      console.error("Create slot error", err);
    });
  };

  return (
    <>
      {loading && <CircularProgress />}

      {/* Calendar */}
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={mode === "coach"}
        dateClick={mode === "coach" ? handleDateClick : undefined}
        eventClick={handleEventClick}
        events={events}
        height="auto"
        weekends={false}
        allDaySlot={false}
        slotMinTime="09:00:00"
        slotMaxTime="21:00:00"
      />

      {/* Student Booking Confirmation Dialog */}
      <Dialog open={bookingDialog.open} onClose={() => setBookingDialog({ open: false, slot: null })}>
        <DialogTitle>Confirm Booking with {selectedCoach?.name}</DialogTitle>
        <DialogContent>
          <Typography>
            Book on {dayjs(bookingDialog.slot?.start).format("YYYY-MM-DD")}, from {dayjs(bookingDialog.slot?.start).format("hh:mm A")} to {dayjs(bookingDialog.slot?.end).format("hh:mm A")}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialog({ open: false, slot: null })}>Cancel</Button>
          <Button onClick={handleBookSlot} variant="contained" sx={{ color: "blue" }}>Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Coach Slot Creation Dialog */}
      <Dialog open={creatingSlot.open} onClose={() => setCreatingSlot({ open: false, slot: null })}>
        <DialogTitle>Create Availability Slot</DialogTitle>
        <DialogContent>
          <Typography>
            Create 2-hour slot on:
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1 }} color="grey">
            {dayjs(creatingSlot.slot?.start).format("YYYY-MM-DD")}, from {dayjs(creatingSlot.slot?.start).format("hh:mm A")} to {dayjs(creatingSlot.slot?.end).format("hh:mm A")}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreatingSlot({ open: false, slot: null })}>Cancel</Button>
          <Button onClick={handleCreateSlot} variant="contained" sx={{ color: "blue" }}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Shared Booking Details Dialog (coach and student) */}
      <BookingDetailsDialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ ...viewDialog, open: false })}
        slot={viewDialog.slot}
        mode={mode}
        feedback={feedback}
        setFeedback={setFeedback}
        onSubmitFeedback={() => {
          axios.post(`http://localhost:5000/slots/feedback/${viewDialog.slot.id}`, {
            rating: feedback.rating,
            notes: feedback.notes,
          })
          .then(() => {
            alert("Feedback submitted!");
            setFeedback({ rating: "", notes: "" });
            fetchSlots();
            setViewDialog({ ...viewDialog, open: false });
          })
          .catch((err) => {
            console.error("Error submitting feedback:", err);
            alert("Failed to submit feedback.");
          });
        }}
      />
    </>
  );
}

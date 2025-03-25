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

export default function CalendarView({ mode, selectedCoach, selectedStudent }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingDialog, setBookingDialog] = useState({ open: false, slot: null });
  const [viewDialog, setViewDialog] = useState({ open: false, slot: null });
  const [feedback, setFeedback] = useState({ rating: "", notes: "" });
  const [creatingSlot, setCreatingSlot] = useState({ open: false, slot: null });

  const fetchSlots = () => {
    if (!selectedStudent?.id && !selectedCoach?.id) {
        setEvents([]);
        return;
      }
      
    const params = {};
    if (selectedCoach?.id) params.coach_id = selectedCoach.id;
    if (selectedStudent?.id) params.student_id = selectedStudent.id;

    setLoading(true);
    axios.get("http://localhost:5000/slots", { params })
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

  useEffect(() => {
    fetchSlots();
  }, [selectedCoach, selectedStudent]);

  const handleEventClick = (info) => {
    const slot = info.event;
    const { isBooked } = slot.extendedProps;
  
    if (isBooked) {
      if (mode === "student") {
        // Show read-only dialog with coach phone number
        setViewDialog({
          open: true,
          slot,
          role: "student",  // Add role so dialog knows what to show
        });
      } else if (mode === "coach") {
        // Show editable feedback dialog for coach
        setFeedback({
          rating: slot.extendedProps.rating || "",
          notes: slot.extendedProps.notes || "",
        });
        setViewDialog({
          open: true,
          slot,
          role: "coach",
        });
      }
    } else if (mode === "student") {
      if (!selectedStudent) return alert("Select a student first.");
      setBookingDialog({ open: true, slot });
    }
  };

  const handleDateClick = (arg) => {
    if (!selectedCoach) return alert("Please select a coach first.");

    const startTime = arg.date;
    const endTime = dayjs(startTime).add(2, "hour").toDate();

    const isOverlapping = events.some((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return startTime < eventEnd && endTime > eventStart;
    });

    if (isOverlapping) return alert("⛔ Overlapping with existing slot");

    // ⏰ Prevent ending past 9 PM (21:00)
    const slotMaxTime = dayjs(startTime).hour(21).minute(0).second(0);
    if (dayjs(endTime).isAfter(slotMaxTime)) {
      return alert("⛔ Slot must end before 9:00 PM");
    }

    setCreatingSlot({ open: true, slot: { start: startTime, end: endTime } });
  };

  const handleBookSlot = () => {
    axios.put(`http://localhost:5000/slots/book/${bookingDialog.slot.id}`, {
      student_id: selectedStudent.id,
    })
      .then(() => {
        setBookingDialog({ open: false, slot: null});
        fetchSlots();
      })
      .catch(() => alert("Failed to book slot."));
  };

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
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={mode === "coach"}
        dateClick={mode === "coach" ? handleDateClick : undefined}
        eventClick={handleEventClick}
        events={events}
        height="auto"
        weekends={false} // Hide weekends
        allDaySlot={false}
        slotMinTime="09:00:00"
        slotMaxTime="21:00:00"
      />

      {/* Booking Dialog */}
      <Dialog open={bookingDialog.open} onClose={() => setBookingDialog({ open: false, slot: null })}>
        <DialogTitle>Confirm Booking with {selectedCoach?.name}</DialogTitle>
        <DialogContent>
          <Typography>
            Book on {dayjs(bookingDialog.slot?.start).format("YYYY-MM-DD")}, from {dayjs(bookingDialog.slot?.start).format("hh:mm A")} to {dayjs(bookingDialog.slot?.end).format("hh:mm A")}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialog({ open: false, slot: null })} color="black">Cancel</Button>
          <Button onClick={handleBookSlot} variant="contained" color="white" sx={{ color: "blue" }}>Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Slot Creation Dialog */}
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
          <Button onClick={() => setCreatingSlot({ open: false, slot: null })} color="black" >Cancel</Button>
          <Button onClick={handleCreateSlot} variant="contained" color="white" sx={{ color: "blue" }}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Booking Details Dialog */}
      <BookingDetailsDialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ ...viewDialog, open: false })}
        slot={viewDialog.slot}
        mode={mode}
        feedback={feedback}
        setFeedback={setFeedback}
        onSubmitFeedback={() => {
            axios
            .post(`http://localhost:5000/slots/feedback/${viewDialog.slot.id}`, {
                rating: feedback.rating,
                notes: feedback.notes,
            })
            .then(() => {
                alert("✅ Feedback submitted!");
                setFeedback({ rating: "", notes: "" });
                fetchSlots(null, viewDialog.slot.extendedProps.coachId);
                setViewDialog({ ...viewDialog, open: false });
            })
            .catch((err) => {
                console.error("Error submitting feedback:", err);
                alert("❌ Failed to submit feedback.");
            });
        }}
    />
    </>
  );
}

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
} from "@mui/material";
import dayjs from "dayjs";

/**
 * BookingDetailsDialog
 * Displays call details for a booked slot.
 * In coach mode, also allows entering/editing feedback and satisfaction rating.
 */
export default function BookingDetailsDialog({
  open,
  onClose,
  slot,
  mode,
  feedback,
  setFeedback,
  onSubmitFeedback,
  onCancel,
}) {
  // Don't render anything if no slot is passed
  if (!slot) return null;

  const isCoach = mode === "coach";

  // Determine which person's name/phone to show based on mode
  const personName = isCoach
    ? slot._def.extendedProps.student_name
    : slot._def.extendedProps.coach_name;

  const personPhone = isCoach
    ? slot._def.extendedProps.student_phone
    : slot._def.extendedProps.coach_phone;

  return (
    <Dialog open={open} onClose={onClose}>
      {/* 🔹 Dialog Title */}
      <DialogTitle color="secondary">
        📞 Booking Details with {personName}
      </DialogTitle>

      <DialogContent>
        <>
          {/* Shared date/time display */}
          <Typography variant="subtitle1" sx={{ mt: 1 }} color="grey">
            {dayjs(slot.start).format("YYYY-MM-DD")} from{" "}
            {dayjs(slot.start).format("hh:mm A")} to{" "}
            {dayjs(slot.end).format("hh:mm A")}
          </Typography>

          {/* Shared phone number */}
          <Typography color="grey" sx={{ mt: 2 }}>
            {personName?.split(" ")[0]}'s phone number:
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1 }} color="grey">
            {personPhone}
          </Typography>

          {/* Coach-only: Satisfaction rating + notes */}
          {isCoach && (
            <>
              {/* 🔢 Rating Dropdown */}
              <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2 }}>
                <Typography color="grey" sx={{ whiteSpace: "nowrap" }}>
                  Rate Student Satisfaction:
                </Typography>
                <TextField
                  select
                  value={feedback.rating}
                  onChange={(e) =>
                    setFeedback({ ...feedback, rating: e.target.value })
                  }
                  sx={{ width: 100 }}
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Notes TextArea */}
              <TextField
                label="Notes"
                multiline
                rows={4}
                fullWidth
                sx={{ mt: 2, "& .MuiInputBase-root": { color: "grey" } }}
                value={feedback.notes}
                onChange={(e) =>
                  setFeedback({ ...feedback, notes: e.target.value })
                }
              />
            </>
          )}
        </>
      </DialogContent>

      {/* Action Buttons */}
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
            variant="contained"
            onClick={onCancel}
            color="white"
            sx={{ color: "blue" }}
          >
            Cancel Booking
          </Button>
        {isCoach && (
          <Button
            variant="contained"
            disabled={!feedback.rating}
            onClick={onSubmitFeedback}
            color="white"
            sx={{ color: "blue" }}
          >
            Submit Feedback
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

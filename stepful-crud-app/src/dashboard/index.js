import React, { useState, useEffect } from "react";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import axios from "axios";
import PersonSelectors from "dashboard/components/PersonSelectors";
import CalendarView from "dashboard/components/CalendarView";

/**
 * Dashboard
 * Main entry point for coach and student views.
 * Includes person selection dropdowns and calendar scheduler.
 */
export default function Dashboard() {
  // State for selected person and mode (coach or student)
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [slotType, setSlotType] = useState(null);

  const [mode, setMode] = useState("coach");

  // Data storage for fetched person lists
  const [students, setStudents] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [slotTypes, setSlotTypes] = useState(["all", "available", "booked"]);

  // Fetch all persons once on mount and categorize by role
  useEffect(() => {
    axios.get("http://localhost:5000/persons")
      .then((res) => {
        setStudents(res.data.filter((p) => p.role === "student"));
        setCoaches(res.data.filter((p) => p.role === "coach"));
      })
      .catch((err) => console.error("Error fetching persons:", err));
  }, []);

  // Reset selected persons when switching modes
  useEffect(() => {
    setSelectedStudent(null);
    setSelectedCoach(null);
    setSlotType(null);
  }, [mode]);

  // Toggle between coach and student mode
  const handleModeChange = (event, newMode) => {
    if (newMode) {
      setMode(newMode);
    }
  };

  return (
    <Box sx={{ p: 6 }}>
      {/* Header with title and mode switch */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5">Coaching Scheduler</Typography>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          color="primary"
          size="small"
        >
          <ToggleButton value="coach">Coach View</ToggleButton>
          <ToggleButton value="student">Student View</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Dropdown selectors for student and coach */}
      <PersonSelectors
        students={mode === "student" ? students : null}
        coaches={coaches}
        slotTypes={slotTypes}
        selectedStudent={selectedStudent}
        setSelectedStudent={setSelectedStudent}
        selectedCoach={selectedCoach}
        setSelectedCoach={setSelectedCoach}
        slotType={slotType}
        setSlotType={setSlotType}
      />

      {/* Calendar rendering based on selected mode/persons */}
      <Box sx={{ px: 2 }}>
        <CalendarView
          mode={mode}
          selectedCoach={selectedCoach}
          selectedStudent={selectedStudent}
        />
      </Box>
    </Box>
  );
}

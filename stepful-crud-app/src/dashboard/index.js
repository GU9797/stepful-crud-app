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

export default function Dashboard() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [mode, setMode] = useState("coach");
  const [students, setStudents] = useState([]);
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/persons")
      .then((res) => {
        setStudents(res.data.filter((p) => p.role === "student"));
        setCoaches(res.data.filter((p) => p.role === "coach"));
      })
      .catch((err) => console.error("Error fetching persons:", err));
  }, []);

  useEffect(() => {
    setSelectedStudent(null);
    setSelectedCoach(null);
  }, [mode]);

  const handleModeChange = (event, newMode) => {
    if (newMode) {
    setMode(newMode);
    }
  };

  return (
    <Box sx={{ p: 6 }}>
      {/* Header bar */}
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

      {/* Person selection */}
      <PersonSelectors
        students={mode === "student" ? students : null}
        coaches={coaches}
        selectedStudent={selectedStudent}
        setSelectedStudent={setSelectedStudent}
        selectedCoach={selectedCoach}
        setSelectedCoach={setSelectedCoach}
      />

      {/* Calendar */}
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

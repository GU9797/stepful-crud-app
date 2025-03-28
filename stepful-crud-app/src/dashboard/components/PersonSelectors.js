import { Autocomplete, TextField, Box } from "@mui/material";

/**
 * PersonSelectors
 * Renders student and/or coach dropdowns based on props.
 * Used to select users for calendar interaction.
 */
export default function PersonSelectors({
  students,
  coaches,
  selectedStudent,
  setSelectedStudent,
  selectedCoach,
  setSelectedCoach,
}) {
  return (
    // Container for dropdowns
    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
      
      {/* Student dropdown - only shown if students prop is passed */}
      {students && (
        <Autocomplete
          disablePortal
          value={selectedStudent}
          options={students}
          getOptionLabel={(option) => option.name}
          sx={{ width: 300 }}
          onChange={(event, newValue) => setSelectedStudent(newValue)}
          renderInput={(params) => <TextField {...params} label="Select Student" />}
        />
      )}

      {/* Coach dropdown - always shown if coaches prop is passed */}
      {coaches && (
        <Autocomplete
          disablePortal
          value={selectedCoach}
          options={coaches}
          getOptionLabel={(option) => option.name}
          sx={{ width: 300 }}
          onChange={(event, newValue) => setSelectedCoach(newValue)}
          renderInput={(params) => <TextField {...params} label="Select Coach" />}
        />
      )}
    </Box>
  );
}

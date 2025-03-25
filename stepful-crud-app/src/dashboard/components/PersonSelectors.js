import { Autocomplete, TextField, Box } from "@mui/material";

export default function PersonSelectors({
  students,
  coaches,
  selectedStudent,
  setSelectedStudent,
  selectedCoach,
  setSelectedCoach,
}) {
  return (
    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
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

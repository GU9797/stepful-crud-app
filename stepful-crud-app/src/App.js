import { useEffect } from "react";

// React Router components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// MUI components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Custom theme
import theme from "assets/theme";

// App views
import Dashboard from "dashboard";

/**
 * App
 * Root component that sets up routing and theming.
 */
export default function App() {
  const { pathname } = useLocation();

  // Scroll to top when navigating to a new route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  return (
    <ThemeProvider theme={theme}>
      {/* Normalize baseline styles */}
      <CssBaseline />

      {/* Define application routes */}
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </ThemeProvider>
  );
}

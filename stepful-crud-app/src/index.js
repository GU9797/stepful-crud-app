import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "App";

// React Context Provider
import { AppControllerProvider } from "context";

const container = document.getElementById("app");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <AppControllerProvider>
      <App />
    </AppControllerProvider>
  </BrowserRouter>
);

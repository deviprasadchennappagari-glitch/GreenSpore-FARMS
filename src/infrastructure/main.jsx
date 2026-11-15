import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import InfrastructurePage from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <InfrastructurePage />
  </StrictMode>,
);

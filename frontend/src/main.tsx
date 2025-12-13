import { ThemeProvider } from "./context/ThemeContext";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply theme from localStorage before React renders
const THEME_KEY = "customTheme";
const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme) {
  try {
    const theme = JSON.parse(savedTheme);
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(
        `--theme-${key}`,
        value as string
      );
    });
  } catch {
    console.error("Invalid theme in localStorage:", savedTheme);
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);

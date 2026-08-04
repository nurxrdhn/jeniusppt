import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import AppErrorBoundary from "./components/ui/AppErrorBoundary.jsx";
import "./styles/global.css";
import "./styles/fresh-orange.css";
import "./styles/word-toolbar.css";
import "./styles/themes.css";
import "./styles/notices.css";
import "./styles/pro-upgrades.css";
import "./styles/mobile-sync.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary><App /></AppErrorBoundary>
  </React.StrictMode>,
);

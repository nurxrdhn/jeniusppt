import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";
import "./styles/fresh-orange.css";
import "./styles/word-toolbar.css";
import "./styles/themes.css";
import "./styles/notices.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

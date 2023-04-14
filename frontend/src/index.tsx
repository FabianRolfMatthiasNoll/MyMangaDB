import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Dashboard from "./Dashboard";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>
);

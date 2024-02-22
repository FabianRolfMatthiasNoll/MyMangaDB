import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./scrollbarStyles.css";
import App from "./App";
import { AuthProvider} from './AuthContext';

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
    
  </React.StrictMode>
);

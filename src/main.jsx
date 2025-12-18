import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

document.documentElement.style.background = "#1c232b";
document.body.style.margin = "0";
document.body.style.background = "#1c232b";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

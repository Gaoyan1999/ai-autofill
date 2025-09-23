import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Test React Framework</h1>
      <p>Hello from React + Vite + pnpm!</p>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);

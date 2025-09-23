import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Checkbox from "@mui/material/Checkbox";

interface OptionsData {
  name: string;
  email: string;
}

const label = { inputProps: { "aria-label": "Checkbox" } };

const Options: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    chrome.storage.sync.get(
      ["name", "email"],
      (result: Partial<OptionsData>) => {
        if (result.name) setName(result.name);
        if (result.email) setEmail(result.email);
      }
    );
  }, []);

  const saveOptions = () => {
    chrome.storage.sync.set({ name, email }, () => {
      alert("Options saved!");
    });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <Checkbox {...label} defaultChecked />
      <h2>Extension Settings</h2>
      <div>
        <label>
          Name:{" "}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Email:{" "}
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
      </div>
      <button onClick={saveOptions}>Save</button>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Options />);

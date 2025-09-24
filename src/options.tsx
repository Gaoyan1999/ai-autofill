import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Checkbox from "@mui/material/Checkbox";
import "./index.css";
import { CollapseSection } from "./CollapseSection";
import { InfoList } from "./InfoList";
import { Box, TextField, Button } from "@mui/material";

interface InfoData {
  label: string;
  value: string;
}

const Options: React.FC = () => {
  const [info, setInfo] = useState<InfoData[]>([
    { label: "Email", value: "daniel@example.com" },
    { label: "Phone", value: "+61 400 123 456" },
    { label: "Location", value: "Sydney, Australia" },
  ]);
  const handleAdd = () => {
    setInfo([...info, { label: "", value: "" }]);
  };
  return (
    <div className="mx-4">      
      <CollapseSection title="Personal Info">
        <InfoList items={info} defaultProperties={["Email", "Name"]} />
        <Button onClick={handleAdd} variant="text" sx={{ mt: 1 }}>
            ADD MORE +
          </Button>
      </CollapseSection>

      <CollapseSection title="Account Settings">
        <p>TODO: 账号设置内容</p>
      </CollapseSection>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Options />);

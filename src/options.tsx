import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Checkbox from "@mui/material/Checkbox";
import { Collapse, IconButton, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface OptionsData {
  name: string;
  email: string;
}

const label = { inputProps: { "aria-label": "Checkbox" } };

const Options: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  // useEffect(() => {
  //   chrome.storage.sync.get(
  //     ["name", "email"],
  //     (result: Partial<OptionsData>) => {
  //       if (result.name) setName(result.name);
  //       if (result.email) setEmail(result.email);
  //     }
  //   );
  // }, []);

  // const saveOptions = () => {
  //   chrome.storage.sync.set({ name, email }, () => {
  //     alert("Options saved!");
  //   });
  // };

  return (
    <Box>
      <div>
        <IconButton onClick={() => setOpen(!open)}>
          <ExpandMoreIcon
            style={{
              transform: open ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "0.3s",
            }}
          />
        </IconButton>
        Personal Info
      </div>
      <Collapse in={open}>
        <Box sx={{ p: 2, mt: 1 }}>这里是展开的内容</Box>
      </Collapse>
    </Box>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Options />);

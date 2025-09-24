import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Checkbox from "@mui/material/Checkbox";
import "./index.css";
import { CollapseSection } from "./CollapseSection";
import { InfoList } from "./InfoList";
import { Box, TextField, Button, ThemeProvider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { blackWhiteTheme } from "./theme";

interface InfoData {
  label: string;
  value: string;
}
const STORAGE_KEY = "userInfo";

const Options: React.FC = () => {
  const [info, setInfo] = useState<InfoData[]>([]);

  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (result[STORAGE_KEY]) {
        setInfo(result[STORAGE_KEY]);
      } else {
        setInfo([
          { label: "Email", value: "" },
          { label: "Name", value: "" },
        ]);
      }
    });
  }, []);
  useEffect(() => {
    if (info.length > 0) {
      chrome.storage.local.set({ [STORAGE_KEY]: info });
    }
  }, [info]);

  const handleAdd = () => {
    setInfo([...info, { label: "", value: "" }]);
  };

  return (
    <div className="mx-4">
      <CollapseSection title="Personal Info">
        <InfoList onChange={setInfo} items={info} />
        <div className="flex justify-center">
          <Button
            onClick={handleAdd}
            variant="outlined"
            className="flex items-center gap-2"
            sx={{
              mt: 1,
              color: "#000",
              borderColor: "#000",
              backgroundColor: "#fff",
              "&:hover": {
                backgroundColor: "#000",
                color: "#fff",
                borderColor: "#000",
              },
              border: "1.5px solid #000",
            }}
          >
            <span>ADD MORE</span>
            <AddIcon />
          </Button>
        </div>
      </CollapseSection>

      <CollapseSection title="Account Settings">
        <p>TODO: 账号设置内容</p>
      </CollapseSection>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Options />);

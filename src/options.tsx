import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { CollapseSection } from "./CollapseSection";
import { InfoList } from "./InfoList";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { isEmpty } from "lodash";

interface InfoData {
  label: string;
  value?: string;
}

type PersonalDataSet = {
  sections: { category: string; items: InfoData[] }[];
  lastUpdated?: string;
};

const defaultPersonalDataSet: PersonalDataSet = {
  sections: [
    {
      category: "Personal Info",
      items: [
        { label: "Email", value: "" },
        { label: "Name", value: "" },
        { label: "Phone", value: "" },
        { label: "Address", value: "" },
      ],
    },
    {
      category: "Education",
      items: [
        { label: "School", value: "" },
        { label: "Major", value: "" },
      ],
    },
    {
      category: "Work Experience",
      items: [
        { label: "Company", value: "" },
        { label: "Position", value: "" },
      ],
    },
  ],
};

const STORAGE_KEY = "userInfo";

const Options: React.FC = () => {
  const [info, setInfo] = useState<InfoData[]>([]);

  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const personInfo = result[STORAGE_KEY];
      if (personInfo) {
        // filter out empty items
        const filteredInfo = personInfo.filter(
          (item: InfoData) => !isEmpty(item.label) || !isEmpty(item.value)
        );
        setInfo(filteredInfo);
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

      <CollapseSection title="Education">
        <div>TODO: Education</div>
      </CollapseSection>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Options />);

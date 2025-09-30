import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { CollapseSection } from "./CollapseSection";
import { InfoList } from "./InfoList";
import { isEmpty } from "lodash";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

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

const STORAGE_KEY = "personalDataSet";

const Options: React.FC = () => {
  const [personalDataSet, setPersonalDataSet] = useState<PersonalDataSet>(
    defaultPersonalDataSet
  );

  const handleSectionChange = (index: number, items: InfoData[]) => {
    const newSections = [...personalDataSet.sections];
    newSections[index] = {
      category: newSections[index]!.category,
      items,
    };
    setPersonalDataSet({ ...personalDataSet, sections: newSections });
  };

  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const personalDataSet = result[STORAGE_KEY];
      if (personalDataSet) {
        // filter out empty items
        const filteredSections = (
          personalDataSet as PersonalDataSet
        ).sections.filter((section) => section.items.length > 0);
        filteredSections.forEach((section) => {
          section.items = section.items.filter(
            (item) => !isEmpty(item.label) || !isEmpty(item.value)
          );
        });
        setPersonalDataSet({
          ...personalDataSet,
          sections: filteredSections,
        });
      } else {
        setPersonalDataSet(defaultPersonalDataSet);
      }
    });
  }, []);
  useEffect(() => {    
    if (personalDataSet.sections.length > 0) {
      chrome.storage.local.set({ [STORAGE_KEY]: personalDataSet });
    }
  }, [personalDataSet]);

  const handleAddItem = (index: number) => {
    const newSections = [...personalDataSet.sections];
    const section = newSections[index]!;
    newSections[index] = {
      category: section.category,
      items: [...section.items, { label: "", value: "" }],
    };
    setPersonalDataSet({ ...personalDataSet, sections: newSections });
  };

  return (
    <div className="mx-4">
      {personalDataSet.sections.map((section, index) => (
        <CollapseSection title={section.category}>
          <InfoList
            onChange={(items) => handleSectionChange(index, items)}
            items={section.items}
          />
          <Button
            onClick={() => handleAddItem(index)}
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
        </CollapseSection>
      ))}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Options />);

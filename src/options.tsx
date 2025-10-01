import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { CollapseSection } from "./CollapseSection";
import { InfoList } from "./InfoList";
import { isEmpty } from "lodash";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { extractText, getDocumentProxy } from "unpdf";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("Please select a valid PDF file");
    }
  };

  const handleProcessPDF = async () => {
    if (!selectedFile) {
      alert("Please select a PDF file first");
      return;
    }

    setIsProcessing(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      // Then, load the PDF file into a PDF.js document
      const pdf = await getDocumentProxy(arrayBuffer);

      // Finally, extract the text from the PDF file
      const { text } = await extractText(pdf, { mergePages: true });
      console.log(text);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Error processing PDF file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

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
    <div className="h-full">
      <div className="bg-black text-white py-6 px-8 rounded-b-lg mb-2 shadow-lg border-gray-300">
        <h1 className="text-3xl font-bold">AI-autofill</h1>
      </div>

      {/* PDF Processing Section */}
      <div className="mx-4 mb-4 p-4 border border-gray-300 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">PDF Processing Test</h2>
        <div className="flex flex-col gap-3">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedFile && (
            <p className="text-sm text-gray-600">
              Selected: {selectedFile.name} (
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
          <Button
            onClick={handleProcessPDF}
            disabled={!selectedFile || isProcessing}
            variant="contained"
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
              "&:disabled": {
                backgroundColor: "#ccc",
              },
            }}
          >
            {isProcessing ? "Processing..." : "Process PDF"}
          </Button>
        </div>
      </div>

      <div className="mx-4">
        {personalDataSet.sections.map((section, index) => (
          <CollapseSection key={index} title={section.category}>
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
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Options />);

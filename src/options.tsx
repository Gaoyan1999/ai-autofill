import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { CollapseSection } from "./CollapseSection";
import { InfoList } from "./InfoList";
import { isEmpty } from "lodash";
import { Button, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { PdfProcessingDialog } from "./PdfProcessingDialog";
import { Attachment } from "./types";
import BackspaceIcon from "@mui/icons-material/Backspace";
import UploadIcon from "@mui/icons-material/Upload";
import Fingerprint from "@mui/icons-material/Fingerprint";
import DeleteIcon from "@mui/icons-material/Delete";

interface InfoData {
  label: string;
  value?: string;
}

type PersonalDataSet = {
  sections: { category: string; items: InfoData[] }[];
  attachments?: Attachment[];
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
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("Please select a valid PDF file");
    }
  };

  const handleExtract = (attachment: Attachment) => {
    setPersonalDataSet({
      ...personalDataSet,
      attachments: [...(personalDataSet.attachments || []), attachment],
    });
    handleClosePdfDialog();
  };
  const handleClosePdfDialog = () => {
    setPdfDialogOpen(false);
    setSelectedFile(null);
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

  const handleAddGroup = () => {
    const newGroupName = prompt("Enter new group name:");
    if (newGroupName && newGroupName.trim()) {
      const newSections = [
        ...personalDataSet.sections,
        {
          category: newGroupName.trim(),
          items: [{ label: "", value: "" }],
        },
      ];
      setPersonalDataSet({ ...personalDataSet, sections: newSections });
    }
  };

  const handleDeleteGroup = (index: number) => {
    if (confirm("Are you sure you want to delete this group?")) {
      const newSections = personalDataSet.sections.filter((_, i) => i !== index);
      setPersonalDataSet({ ...personalDataSet, sections: newSections });
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 to-black min-h-screen">
      {/* header */}
      <div className="bg-black shadow-lg border-b border-gray-800">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 rounded-xl flex items-center justify-center border border-gray-700">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Autofill</h1>
              <p className="text-sm text-gray-400">Smart form filling assistant</p>
            </div>
          </div>
          <IconButton
            aria-label="upload"
            size="large"
            onClick={() => setPdfDialogOpen(true)}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderColor: "rgba(255, 255, 255, 0.3)",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <UploadIcon />
          </IconButton>
        </div>
      </div>
      <PdfProcessingDialog
        open={pdfDialogOpen}
        onExtract={handleExtract}
        onClose={handleClosePdfDialog}
      />

      {/* sections */}
      <div className="px-6 py-4 space-y-4">
        {personalDataSet.sections.map((section, index) => (
          <div key={index} className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
            <CollapseSection 
              title={section.category}
              onAdd={handleAddGroup}
              onDelete={() => handleDeleteGroup(index)}
              showAddButton={true}
              showDeleteButton={true}
            >
              <div className="px-2">
                <InfoList
                  onChange={(items) => handleSectionChange(index, items)}
                  items={section.items}
                />
                <Button
                  onClick={() => handleAddItem(index)}
                  variant="outlined"
                  className="flex items-center gap-2 mt-4 w-full"
                  sx={{
                    color: "#ffffff",
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <AddIcon fontSize="small" />
                  <span>Add More Items</span>
                </Button>
              </div>
            </CollapseSection>
          </div>
        ))}
      </div>
      {/* attachments */}
      <div className="px-6 py-4">
        <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
          <CollapseSection title="Attachments">
            <div className="px-2">
              {personalDataSet.attachments?.length ? (
                personalDataSet.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg mb-2 last:mb-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center border border-gray-600">
                        <span className="text-white text-sm font-medium">PDF</span>
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{attachment.name}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(attachment.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <IconButton
                      aria-label="delete"
                      size="small"
                      onClick={() => {
                        const newAttachments = personalDataSet.attachments?.filter(
                          (_, i) => i !== index
                        );
                        setPersonalDataSet({
                          ...personalDataSet,
                          attachments: newAttachments || [],
                        });
                      }}
                      sx={{
                        color: "#9ca3af",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          color: "#ffffff",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <BackspaceIcon fontSize="small" />
                    </IconButton>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <UploadIcon sx={{ fontSize: 48, color: "#6b7280", mb: 2 }} />
                  <p className="text-sm">No attachments yet</p>
                  <p className="text-xs text-gray-500">Upload PDF files to get started</p>
                </div>
              )}
            </div>
          </CollapseSection>
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<Options />);

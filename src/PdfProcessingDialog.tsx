import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { extractText, getDocumentProxy } from "unpdf";
import { Attachment } from "./types";

interface PdfProcessingDialogProps {
  open: boolean;
  onExtract: (attachment: Attachment) => void;
  onClose: () => void;
}

export const PdfProcessingDialog: React.FC<PdfProcessingDialogProps> = ({
  open,
  onExtract,
  onClose,
}) => {
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
      onExtract({
        name: selectedFile.name,
        content: text,
        uploadedAt: Date.now(),
      });
      setSelectedFile(null);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Error processing PDF file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle className="flex justify-between items-center">
        <span>PDF Processing</span>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <div className="flex flex-col gap-4 py-4">
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
        </div>
      </DialogContent>
      <DialogActions>
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
      </DialogActions>
    </Dialog>
  );
};

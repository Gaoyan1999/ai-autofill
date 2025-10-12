import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Paper,
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
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #e5e7eb",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
          px: 3,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#374151" }}>
          PDF Processing
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            color: "#6b7280",
            "&:hover": {
              backgroundColor: "#f3f4f6",
              color: "#374151",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent className="p-3 mt-2">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Paper
            variant="outlined"
            sx={{
              border: "2px dashed #d1d5db",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              backgroundColor: "#fafafa",
              cursor: "pointer",
              "&:hover": {
                borderColor: "#9ca3af",
                backgroundColor: "#f5f5f5",
              },
              transition: "all 0.2s ease-in-out",
              position: "relative",
            }}
            onClick={() => {
              const input = document.getElementById('pdf-file-input') as HTMLInputElement;
              input?.click();
            }}
          >
            <input
              id="pdf-file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{
                position: "absolute",
                opacity: 0,
                width: "100%",
                height: "100%",
                cursor: "pointer",
                top: 0,
                left: 0,
              }}
            />
            <Typography
              variant="body2"
              sx={{ color: "#6b7280", mt: 1 }}
            >
              Click & Upload a PDF file to make the autofiller know you better!
            </Typography>
          </Paper>
          {selectedFile && (
            <Paper
              variant="outlined"
              sx={{
                backgroundColor: "#f9fafb",
                borderRadius: 2,
                p: 2,
                border: "1px solid #e5e7eb",
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "#374151", fontWeight: 500 }}
              >
                Selected: {selectedFile.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#6b7280", mt: 0.5, display: "block" }}
              >
                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Paper>
          )}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          backgroundColor: "#f9fafb",
          borderTop: "1px solid #e5e7eb",
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={handleProcessPDF}
          disabled={!selectedFile || isProcessing}
          variant="contained"
          sx={{
            backgroundColor: "#374151",
            color: "#ffffff",
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 500,
            fontSize: "14px",
            textTransform: "none",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            "&:hover": {
              backgroundColor: "#1f2937",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            },
            "&:disabled": {
              backgroundColor: "#d1d5db",
              color: "#9ca3af",
            },
          }}
        >
          {isProcessing ? "Processing..." : "Process PDF"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

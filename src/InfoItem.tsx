import * as React from "react";
import { Box, IconButton, TextField } from "@mui/material";
import BackspaceIcon from '@mui/icons-material/Backspace';

interface InfoItemProps {
  label: string;
  value?: string;
  onChange: (label: string, value?: string) => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

export function InfoItem({ label, value, onChange, onDelete, showDeleteButton = true }: InfoItemProps) {
  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value, value);
  };
  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(label, event.target.value);
  };

  return (
    <Box className="flex py-3 items-center space-x-3 bg-gray-800 rounded-lg px-3 mb-2 last:mb-0 border border-gray-700">
      <div className="flex items-center flex-grow space-x-3">
        <TextField
          id="label-field"
          variant="outlined"
          value={label}
          onChange={handleLabelChange}
          placeholder="Label"
          size="small"
          sx={{
            minWidth: "120px",
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#374151",
              borderRadius: "8px",
              "& fieldset": {
                borderColor: "#6b7280",
              },
              "&:hover fieldset": {
                borderColor: "#9ca3af",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#ffffff",
                borderWidth: "2px",
              },
            },
            "& .MuiInputBase-input": {
              fontSize: "14px",
              padding: "8px 12px",
              color: "#ffffff",
            },
            "& .MuiInputBase-input::placeholder": {
              color: "#9ca3af",
            },
          }}
        />
        <TextField
          className="flex-grow"
          id="value-field"
          variant="outlined"
          value={value}
          onChange={handleValueChange}
          placeholder="Value"
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#374151",
              borderRadius: "8px",
              "& fieldset": {
                borderColor: "#6b7280",
              },
              "&:hover fieldset": {
                borderColor: "#9ca3af",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#ffffff",
                borderWidth: "2px",
              },
            },
            "& .MuiInputBase-input": {
              fontSize: "14px",
              padding: "8px 12px",
              color: "#ffffff",
            },
            "& .MuiInputBase-input::placeholder": {
              color: "#9ca3af",
            },
          }}
        />
      </div>
      {showDeleteButton && onDelete && (
        <IconButton
          aria-label="delete"
          size="small"
          onClick={onDelete}
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
      )}
    </Box>
  );
}

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
    <Box className="flex py-2 items-center space-x-2">
      <div className="flex items-end flex-grow space-x-2">
        <TextField
          id="standard-basic"
          variant="standard"
          value={label}
          onChange={handleLabelChange}
        />
        <TextField
          className="flex-grow"
          id="outlined-basic"
          variant="outlined"
          value={value}
          onChange={handleValueChange}
        />
      </div>
      {showDeleteButton && onDelete && (
        <IconButton
          aria-label="delete"
          size="small"
          onClick={onDelete}
        >
          <BackspaceIcon />
        </IconButton>
      )}
    </Box>
  );
}

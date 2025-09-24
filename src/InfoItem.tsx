import * as React from "react";
import { Box, TextField } from "@mui/material";

interface InfoItemProps {
  label: string;
  value?: string | React.ReactNode;
}

export function InfoItem({ label, value }: InfoItemProps) {
  return (
    <Box className="flex py-2 items-end space-x-2">
      <TextField id="standard-basic" variant="standard" value={label} />
      <TextField className="flex-grow-1" id="outlined-basic" variant="outlined" value={value} />
    </Box>
  );
}

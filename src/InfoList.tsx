import * as React from "react";
import { Box } from "@mui/material";
import { InfoItem } from "./InfoItem";

interface InfoListProps {
  items: { label: string; value: string | React.ReactNode }[];
  defaultProperties?: string[];
}

export function InfoList({ items, defaultProperties }: InfoListProps) {
  return (
    <Box className="">
      {defaultProperties &&
        defaultProperties.map((label, index) => (
          <InfoItem key={index} label={label} />
        ))}
      {items.map((item, index) => (
        <InfoItem key={index} label={item.label} value={item.value} />
      ))}
    </Box>
  );
}

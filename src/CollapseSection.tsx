import * as React from "react";
import { Collapse, IconButton, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface CollapseSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapseSection({
  title,
  children,
  defaultOpen = true,
}: CollapseSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div>      
      <div className="flex items-center py-2">
        <IconButton onClick={() => setOpen(!open)}>
          <ExpandMoreIcon
            style={{
              transform: open ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "0.3s",
            }}
          />
        </IconButton>
        <span className="text-lg font-semibold ml-1">{title}</span>
      </div>

      <Collapse in={open}>
        <Box sx={{ p: 2, mt: 1 }}>{children}</Box>
      </Collapse>
    </div>
  );
}

import * as React from "react";
import { Collapse, IconButton, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

interface CollapseSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onAdd?: () => void;
  onDelete?: () => void;
  showAddButton?: boolean;
  showDeleteButton?: boolean;
}

export function CollapseSection({
  title,
  children,
  defaultOpen = true,
  onAdd,
  onDelete,
  showAddButton = false,
  showDeleteButton = false,
}: CollapseSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center">
          <IconButton 
            onClick={() => setOpen(!open)}
            sx={{
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
              },
              transition: "all 0.2s ease",
            }}
          >
            <ExpandMoreIcon
              style={{
                transform: open ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform 0.3s ease",
              }}
            />
          </IconButton>
          <span className="text-lg font-semibold text-white ml-1">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {showAddButton && onAdd && (
            <IconButton
              onClick={onAdd}
              size="small"
              sx={{
                color: "#9ca3af",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                },
                transition: "all 0.2s ease",
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          )}
          {showDeleteButton && onDelete && (
            <IconButton 
              onClick={onDelete} 
              size="small"
              sx={{
                color: "#9ca3af",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                },
                transition: "all 0.2s ease",
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </div>
      </div>

      <Collapse in={open}>
        <Box sx={{ p: 3, backgroundColor: "#1f2937" }}>{children}</Box>
      </Collapse>
    </div>
  );
}

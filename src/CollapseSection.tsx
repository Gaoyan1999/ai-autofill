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
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center">
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
        <div className="flex items-center gap-1">
          {showAddButton && onAdd && (
            <IconButton
              onClick={onAdd}
              size="small"
              sx={{
                color: "#000",
                "&:hover": {
                  backgroundColor: "#f0f0f0",
                },
              }}
            >
              <AddIcon />
            </IconButton>
          )}
          {showDeleteButton && onDelete && (
            <IconButton onClick={onDelete} size="small">
              <DeleteIcon />
            </IconButton>
          )}
        </div>
      </div>

      <Collapse in={open}>
        <Box sx={{ p: 2, mt: 1 }}>{children}</Box>
      </Collapse>
    </div>
  );
}

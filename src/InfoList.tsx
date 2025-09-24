import { Box } from "@mui/material";
import { InfoItem } from "./InfoItem";

interface InfoListProps {
  items: { label: string; value: string }[];
  defaultProperties?: string[];
  onChange: (items: { label: string; value: string }[]) => void;
}

export function InfoList({ items, onChange }: InfoListProps) {
  const itemChange = (index: number, label: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { label, value };
    onChange(newItems);
  };

  const handleDelete = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  return (
    <Box>
      {items.map((item, index) => (
        <InfoItem
          key={index}
          label={item.label}
          value={item.value}
          onChange={(label, value) => itemChange(index, label, value)}
          onDelete={() => handleDelete(index)}
          showDeleteButton={items.length > 1}
        />
      ))}
    </Box>
  );
}

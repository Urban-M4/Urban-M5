import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface NotesProps {
  value: string;
  onChange: (value: string) => void;
}

export function Notes({ value, onChange }: NotesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleClick = () => {
    setIsEditing(true);
    setEditValue(value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      if (editValue !== value) {
        onChange(editValue);
      }
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(value);
    }
  };

  if (isEditing) {
    return (
      <div className="mt-4">
        <label className="text-sm font-medium mb-2 block">Notes</label>
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="min-h-10"
        />
      </div>
    );
  }

  return (
    <div className="mt-4">
      <label className="text-sm font-medium mb-2 block">Notes</label>
      <div
        onClick={handleClick}
        className="p-3 rounded-md cursor-text hover:bg-accent/50 transition-colors min-h-10 whitespace-pre-wrap"
      >
        {value || (
          <span className="text-muted-foreground">Click to add notes...</span>
        )}
      </div>
    </div>
  );
}

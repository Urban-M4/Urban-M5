"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { useAllTags } from "@/hooks/streetscapes";

interface TagsProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function Tags({ tags, onChange }: TagsProps) {
  const anchor = useComboboxAnchor();
  const [inputValue, setInputValue] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);

  const allTags = useAllTags();

  const handleAddCustomTag = (value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onChange([...tags, trimmedValue]);
      setInputValue("");
    }
  };

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue("");
    }
  };

  if (!isEditing) {
    return (
      <div className="flex flex-row gap-2 items-start">
        <label className="text-sm font-medium whitespace-nowrap pt-3">
          Tags
        </label>
        <div
          onClick={handleClick}
          className="p-3 rounded-md cursor-pointer hover:bg-accent/50 transition-colors min-h-10 flex flex-wrap gap-2 items-center justify-between group flex-1"
        >
          <div className="flex flex-wrap gap-2 items-center flex-1">
            {tags.length > 0 ? (
              tags.map((tag) => <Badge key={tag}>{tag}</Badge>)
            ) : (
              <span className="text-muted-foreground">
                Click to add tags...
              </span>
            )}
          </div>
          <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-2 items-center">
      <label className="text-sm font-medium whitespace-nowrap">Tags</label>
      <Combobox
        multiple
        autoHighlight
        items={allTags}
        value={tags}
        onValueChange={onChange}
        onInputValueChange={setInputValue}
      >
        <ComboboxChips ref={anchor} className="flex-1">
          <ComboboxValue>
            {(values) => (
              <React.Fragment>
                {values.map((value: string) => (
                  <ComboboxChip key={value}>{value}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  placeholder="Add tag..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && inputValue.trim()) {
                      e.preventDefault();
                      handleAddCustomTag(inputValue);
                    } else if (e.key === "Escape") {
                      handleKeyDown(e);
                    }
                  }}
                  onBlur={handleBlur}
                  autoFocus
                />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No tags found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

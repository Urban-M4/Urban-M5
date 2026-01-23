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

interface TagItem {
  creatable?: string;
  value: string;
}

// Modelled after https://base-ui.com/react/components/combobox#creatable

export function Tags({ tags, onChange }: TagsProps) {
  const anchor = useComboboxAnchor();
  const [inputValue, setInputValue] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);
  const lastValueRef = React.useRef<string[]>([]);

  const allTags = useAllTags();

  const trimmed = inputValue.trim();
  const lowered = trimmed.toLowerCase();
  const exactExists = allTags.some((tag) => tag.toLowerCase() === lowered);

  // Show the creatable item if there's input that doesn't match existing tags
  const itemsForView: TagItem[] =
    trimmed !== "" && !exactExists
      ? [
          ...allTags.map((tag) => ({ value: tag })),
          { creatable: trimmed, value: `Create "${trimmed}"` },
        ]
      : allTags.map((tag) => ({ value: tag }));

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    setInputValue("");
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
        items={itemsForView}
        value={tags}
        onValueChange={(next) => {
          // Prevent duplicate calls with the same value
          if (
            lastValueRef.current.length === next.length &&
            lastValueRef.current.every((v) => next.includes(v))
          ) {
            return;
          }

          lastValueRef.current = next;

          const creatableItem = itemsForView.find((iv) => iv.creatable);

          // Check if the new selection includes the creatable item
          const hasCreatable =
            creatableItem && next.includes(creatableItem.value);

          if (hasCreatable && creatableItem) {
            // User selected "Create X" option
            const match = creatableItem.value.match(/Create "(.+)"/);
            if (match) {
              const newTag = match[1];
              // Add the new tag to existing tags (filter out the creatable item from next)
              const filteredNext = next.filter(
                (item) => item !== creatableItem.value,
              );
              const updatedTags = [...filteredNext, newTag];
              onChange(updatedTags);
              lastValueRef.current = updatedTags;
            }
            setInputValue("");
            return;
          }

          // Regular tag selection - just update with the selected tags
          onChange(next);
        }}
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
            {(item: TagItem) =>
              item.creatable ? (
                <ComboboxItem key={item.value} value={item.value}>
                  <span className="text-muted-foreground">+ {item.value}</span>
                </ComboboxItem>
              ) : (
                <ComboboxItem key={item.value} value={item.value}>
                  {item.value}
                </ComboboxItem>
              )
            }
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

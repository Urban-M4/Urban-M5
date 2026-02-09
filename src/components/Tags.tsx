"use client";

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
import { Button } from "./ui/button";

interface TagsProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function Tags({ tags, onChange }: TagsProps) {
  const allTags = useAllTags();
  const anchor = useComboboxAnchor();

  // Merge current tags into the items list so the Combobox always
  // recognises every selected value. Without this, tags added outside
  // the Combobox (e.g. via the "+" button) may not yet appear in
  // allTags (fetched from /stats) and the Combobox would strip them
  // from the value on the next onValueChange cycle.
  const set = new Set(allTags);
  for (const t of tags) {
    set.add(t);
  }
  const items = Array.from(set);

  // TODO add toggle between view and edit mode, and only show the Combobox in edit mode. In view mode, just show the tags as chips without the input box and dropdown.

  return (
    <div className="flex flex-row gap-2 items-center">
      <Combobox
        multiple
        autoHighlight
        items={items}
        value={tags}
        onValueChange={(newTags) => {
          onChange(newTags);
        }}
      >
        <ComboboxChips ref={anchor} className="w-full max-w-xs">
          <ComboboxValue>
            {(values) => (
              <>
                {values.map((value: string) => (
                  <ComboboxChip key={value}>{value}</ComboboxChip>
                ))}
                <ComboboxChipsInput />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <Button
        onClick={() => {
          // TODO replace prompt with https://base-ui.com/react/components/combobox#creatable
          const newTag = window.prompt("Enter new tag:")?.trim();
          if (newTag) {
            onChange([...tags, newTag]);
          }
        }}
        variant="ghost"
        size="sm"
      >
        +
      </Button>
    </div>
  );
}

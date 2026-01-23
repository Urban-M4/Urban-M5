import { useAllLabels } from "@/hooks/streetscapes";
import { useAnnotationVisibility } from "@/lib/store";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export function LabelVisibilityMenu() {
  const labels = useAllLabels();
  const { hiddenLabels, toggleLabel } = useAnnotationVisibility();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline">Label visibility</Button>}
      ></DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          {Object.entries(labels).map(([label, color]) => (
            <DropdownMenuCheckboxItem
              key={label}
              className="flex items-center justify-between"
              checked={!hiddenLabels.has(label)}
              onCheckedChange={() => toggleLabel(label)}
            >
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: color }}
                ></span>
                {label}
              </span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

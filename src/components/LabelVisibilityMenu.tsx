import { useAllLabels } from "@/hooks/streetscapes";
import { useAnnotationVisibility } from "@/lib/store";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { CheckCheck, RefreshCw, SquareMinus } from "lucide-react";

export function LabelVisibilityMenu() {
  const labels = useAllLabels();
  const labelEntries = Object.entries(labels);
  const labelNames = labelEntries.map(([label]) => label);
  const {
    hiddenLabels,
    toggleLabel,
    showAllLabels,
    hideAllLabels,
    invertLabels,
  } = useAnnotationVisibility();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline">Label visibility</Button>}
      ></DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto min-w-max">
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Selection</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={showAllLabels}>
                <CheckCheck />
                Select all
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => hideAllLabels(labelNames)}>
                <SquareMinus />
                Select none
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => invertLabels(labelNames)}>
                <RefreshCw />
                Invert selection
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          {labelEntries
            .toSorted(([a], [b]) => a.localeCompare(b))
            .map(([label, color]) => (
              <DropdownMenuCheckboxItem
                key={label}
                className="flex items-center justify-between"
                checked={!hiddenLabels.has(label)}
                onCheckedChange={() => toggleLabel(label)}
              >
                <span className="flex items-center gap-2 whitespace-nowrap">
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

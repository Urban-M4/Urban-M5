import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs";
import { useAllTags, useAllLabels, useAllSources } from "../hooks/streetscapes";
import { Label } from "./ui/label";
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
} from "./ui/combobox";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "./ui/sidebar";
import { SegmentImages } from "./SegmentImages";

interface Filters {
  sources: string[];
  tags: string[];
  max_captured_at: string | undefined;
  min_captured_at: string | undefined;
  labels: string[];
}

export function Filters() {
  const [filters, setFilters] = useQueryStates(
    {
      sources: parseAsArrayOf(parseAsString).withDefault([]),
      tags: parseAsArrayOf(parseAsString).withDefault([]),
      max_captured_at: parseAsString,
      min_captured_at: parseAsString,
      labels: parseAsArrayOf(parseAsString).withDefault([]),
    },
    {
      shallow: false,
    },
  );

  const sources = useAllSources();
  const { data: tags } = useAllTags();
  const labels = useAllLabels();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({ [name]: value || null });
  };

  const handleMultiSelectChange = (name: string, value: string[]) => {
    setFilters({ [name]: value });
  };

  const handleReset = () => {
    setFilters({
      sources: [],
      tags: [],
      max_captured_at: null,
      min_captured_at: null,
      labels: [],
    });
  };

  const hasActiveFilters =
    filters.sources.length > 0 ||
    filters.tags.length > 0 ||
    filters.labels.length > 0 ||
    filters.max_captured_at ||
    filters.min_captured_at;

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Sources</SidebarGroupLabel>
        <SidebarGroupContent>
          <Combobox
            items={sources}
            multiple
            value={filters.sources}
            onValueChange={(value) =>
              handleMultiSelectChange("sources", value as string[])
            }
          >
            <ComboboxChips>
              <ComboboxValue>
                {filters.sources.map((item) => (
                  <ComboboxChip key={item}>{item}</ComboboxChip>
                ))}
              </ComboboxValue>
              <ComboboxChipsInput placeholder="Select sources..." />
            </ComboboxChips>
            <ComboboxContent>
              <ComboboxEmpty>No sources found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Tags</SidebarGroupLabel>
        <SidebarGroupContent>
          <Combobox
            items={tags || []}
            multiple
            value={filters.tags}
            onValueChange={(value) =>
              handleMultiSelectChange("tags", value as string[])
            }
          >
            <ComboboxChips>
              <ComboboxValue>
                {filters.tags.map((item) => (
                  <ComboboxChip key={item}>{item}</ComboboxChip>
                ))}
              </ComboboxValue>
              <ComboboxChipsInput placeholder="Select tags..." />
            </ComboboxChips>
            <ComboboxContent>
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
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Captured At</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="space-y-2 ml-4">
            <div>
              <Label className="mb-1 text-sm">From:</Label>
              <Input
                type="date"
                name="min_captured_at"
                onChange={handleInputChange}
                max={new Date().toISOString().split("T")[0]}
                value={filters.min_captured_at || ""}
              />
            </div>
            <div>
              <Label className="mb-1 text-sm">To:</Label>
              <Input
                type="date"
                name="max_captured_at"
                onChange={handleInputChange}
                max={new Date().toISOString().split("T")[0]}
                value={filters.max_captured_at || ""}
              />
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Labels</SidebarGroupLabel>
        <SidebarGroupContent>
          <Combobox
            items={Object.keys(labels)}
            multiple
            value={filters.labels}
            onValueChange={(value) =>
              handleMultiSelectChange("labels", value as string[])
            }
          >
            <ComboboxChips>
              <ComboboxValue>
                {filters.labels.map((item) => (
                  <ComboboxChip key={item}>{item}</ComboboxChip>
                ))}
              </ComboboxValue>
              <ComboboxChipsInput placeholder="Select labels..." />
            </ComboboxChips>
            <ComboboxContent>
              <ComboboxEmpty>No labels found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupContent>
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full"
            disabled={!hasActiveFilters}
          >
            Reset Filters
          </Button>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

export function FilterPanel() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent className="p-2">
        <Filters />
      </SidebarContent>
      <SidebarFooter>
        <SegmentImages />
      </SidebarFooter>
      <SidebarFooter />
    </Sidebar>
  );
}

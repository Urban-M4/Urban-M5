import { useAnnotationVisibility } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";

interface ToggleSegmentationsButtonProps {
  allSegmentationIds: string[];
}

export function ToggleSegmentationsButton({
  allSegmentationIds,
}: ToggleSegmentationsButtonProps) {
  const { hiddenSegmentations, showAllSegmentations, hideAllSegmentations } =
    useAnnotationVisibility();

  const totalHidden = hiddenSegmentations.size;
  const totalItems = allSegmentationIds.length;
  const isAllHidden = totalHidden === totalItems;
  const isPartiallyHidden = totalHidden > 0 && totalHidden < totalItems;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (isAllHidden || isPartiallyHidden) {
          showAllSegmentations();
        } else {
          hideAllSegmentations(allSegmentationIds);
        }
      }}
      title={isAllHidden ? "Show all" : "Hide all"}
    >
      {isPartiallyHidden ? (
        <EyeSlashIcon size={16} className="mr-2" />
      ) : (
        <EyeIcon size={16} className="mr-2" />
      )}
      {isAllHidden ? "Show All" : "Hide All"}
    </Button>
  );
}

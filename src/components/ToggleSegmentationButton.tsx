import { Button } from "@/components/ui/button";
import { EyeIcon, EyeClosedIcon } from "@phosphor-icons/react";
import { useAnnotationVisibility } from "@/lib/store";

interface ToggleSegmentationButtonProps {
  segmentationId: string;
}

export function ToggleSegmentationButton({
  segmentationId,
}: ToggleSegmentationButtonProps) {
  const { hiddenSegmentations, toggleSegmentation } = useAnnotationVisibility();
  const isHidden = hiddenSegmentations.has(segmentationId);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toggleSegmentation(segmentationId)}
      title={isHidden ? "Show segmentation" : "Hide segmentation"}
    >
      {isHidden ? <EyeClosedIcon size={16} /> : <EyeIcon size={16} />}
    </Button>
  );
}

import type { Segmentation } from "@/hooks/streetscapes";
import { useAllLabels } from "@/hooks/streetscapes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SegmentImage } from "@/components/SegmentImage";
import { useHoverSegmentationInstance } from "@/lib/store";
import { ToggleSegmentationButton } from "@/components/ToggleSegmentationButton";
import { ToggleSegmentationsButton } from "@/components/ToggleSegmentationsButton";

interface SegmentationsProps {
  imageId: string;
  segmentations: Segmentation[];
}

function SegmentationCard({ segmentation }: { segmentation: Segmentation }) {
  const labels = useAllLabels();
  const {
    segmentationId: hoveredSegmentationId,
    instanceIndex: hoveredInstanceIndex,
    setHover,
    clearHover,
  } = useHoverSegmentationInstance();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{segmentation.id}</CardTitle>
          <ToggleSegmentationButton segmentationId={segmentation.id} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Model:</span> {segmentation.model_name}
        </div>
        {segmentation.run_args && (
          <details>
            <summary>Parameters</summary>
            <pre>
              <code>{segmentation.run_args}</code>
            </pre>
          </details>
        )}
        {segmentation.notes && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Notes:</span> {segmentation.notes}
          </div>
        )}
        {segmentation.instances && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Instances:</span>
            <div className="flex flex-wrap gap-2">
              {segmentation.instances.map((instance, instanceIndex) => {
                const color =
                  labels[instance.label as keyof typeof labels] || "#6b7280";
                const isHovered =
                  hoveredSegmentationId === segmentation.id &&
                  hoveredInstanceIndex === instanceIndex;
                return (
                  <Badge
                    key={instanceIndex}
                    variant="secondary"
                    style={{
                      backgroundColor: color + "20",
                      color: color,
                      borderColor: color,
                      borderWidth: isHovered ? 2 : 1,
                    }}
                    className="border"
                    onMouseEnter={() =>
                      setHover(segmentation.id, instanceIndex)
                    }
                    onMouseLeave={clearHover}
                  >
                    {instance.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Segmentations({ imageId, segmentations }: SegmentationsProps) {
  const allSegmentationIds = segmentations.map((s) => s.id);

  const header = (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium">Segmentations:</span>
      <div
        className="flex items-center gap-2"
        aria-label="Actions on segmentations"
      >
        <ToggleSegmentationsButton allSegmentationIds={allSegmentationIds} />
        <SegmentImage imageId={imageId} />
      </div>
    </div>
  );

  if (segmentations.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        {header}
        <span className="text-sm text-muted-foreground">
          No segmentations available
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {header}
      <div className="flex flex-col gap-3">
        {segmentations.map((segmentation, index) => (
          <SegmentationCard key={index} segmentation={segmentation} />
        ))}
      </div>
    </div>
  );
}

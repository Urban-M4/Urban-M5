import type { Segmentation } from "@/hooks/streetscapes";
import { useAllLabels } from "@/hooks/streetscapes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SegmentationsProps {
  segmentations: Segmentation[];
}

function SegmentationCard({ segmentation }: { segmentation: Segmentation }) {
  const labels = useAllLabels();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{segmentation.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Model:</span> {segmentation.model}
        </div>
        {segmentation.params && (
          <details>
            <summary>Parameters</summary>
            <pre>
              <code>
                {JSON.stringify(JSON.parse(segmentation.params), null, 2)}
              </code>
            </pre>
          </details>
        )}
        {segmentation.notes && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Notes:</span> {segmentation.notes}
          </div>
        )}
        {segmentation.instances.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Instances:</span>
            <div className="flex flex-wrap gap-2">
              {segmentation.instances.map((instance, instanceIndex) => {
                const color =
                  labels[instance.label as keyof typeof labels] || "#6b7280";
                return (
                  <Badge
                    key={instanceIndex}
                    variant="secondary"
                    style={{
                      backgroundColor: color + "20",
                      color: color,
                      borderColor: color,
                    }}
                    className="border"
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

export function Segmentations({ segmentations }: SegmentationsProps) {
  if (segmentations.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Segmentations:</span>
        <span className="text-sm text-muted-foreground">
          No segmentations available
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium">Segmentations:</span>
      <div className="flex flex-col gap-3">
        {segmentations.map((segmentation, index) => (
          <SegmentationCard key={index} segmentation={segmentation} />
        ))}
      </div>
    </div>
  );
}

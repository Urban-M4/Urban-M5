import {
  useCurrentImageId,
  useSegmentationActions,
  type Segmentation,
} from "@/hooks/streetscapes";
import {
  SegmentInstanceSortButton,
  type SegmentationsSortMode,
  useSortedInstances,
} from "@/components/SegmentInstanceSortButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SegmentImage } from "@/components/SegmentImage";
import { ToggleSegmentationButton } from "@/components/ToggleSegmentationButton";
import { ToggleSegmentationsButton } from "@/components/ToggleSegmentationsButton";
import { SegmentInstance } from "@/components/SegmentInstance";
import { useState } from "react";
import { Rating } from "./rating";

interface SegmentationsProps {
  imageId: string;
  segmentations: Segmentation[];
}

function SegmentationCard({
  segmentation,
  sortMode,
}: {
  segmentation: Segmentation;
  sortMode: SegmentationsSortMode;
}) {
  const { setSegmentationRating } = useSegmentationActions();
  const image_id = useCurrentImageId()[0]!;
  const sortedInstances = useSortedInstances(segmentation.instances, sortMode);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{segmentation.id}</CardTitle>
          <ToggleSegmentationButton segmentationId={segmentation.id} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex flex-row gap-4">
          <div className="text-sm">
            <span className="text-sm font-medium">Model:</span>{" "}
            {segmentation.model_name}
          </div>
          <Rating
            value={segmentation.rating}
            onChange={(value) =>
              setSegmentationRating({
                params: {
                  query: { rating: value },
                  path: {
                    image_id: image_id,
                    run_name: segmentation.id,
                  },
                },
              })
            }
          />
          {segmentation.run_args && (
            <details>
              <summary title="View parameters (click to expand)">
                Parameters
              </summary>
              <pre>
                <code>
                  {JSON.stringify(JSON.parse(segmentation.run_args), null, 2)}
                </code>
              </pre>
            </details>
          )}
          {segmentation.notes && (
            <div className="text-sm">
              <span className="font-medium">Notes:</span> {segmentation.notes}
            </div>
          )}
        </div>
        {segmentation.instances && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium">Instances:</span>
              {sortedInstances.map(({ instance, instanceIndex }) => (
                <SegmentInstance
                  key={instanceIndex}
                  instance={instance}
                  segmentationId={segmentation.id}
                  run_name={segmentation.id}
                  instanceIndex={instanceIndex}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Segmentations({ imageId, segmentations }: SegmentationsProps) {
  const [sortMode, setSortMode] = useState<SegmentationsSortMode>("label");
  const allSegmentationIds = segmentations.map((s) => s.id);

  const header = (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium">Segmentations:</span>
      <div
        className="flex items-center gap-2"
        aria-label="Actions on segmentations"
      >
        <ToggleSegmentationsButton allSegmentationIds={allSegmentationIds} />
        <SegmentInstanceSortButton mode={sortMode} onChange={setSortMode} />
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
          <SegmentationCard
            key={index}
            segmentation={segmentation}
            sortMode={sortMode}
          />
        ))}
      </div>
    </div>
  );
}

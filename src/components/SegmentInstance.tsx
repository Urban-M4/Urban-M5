import type { Instance } from "@/hooks/streetscapes";
import {
  useAllLabels,
  useCurrentImageId,
  useSegmentationActions,
} from "@/hooks/streetscapes";
import { Badge } from "@/components/ui/badge";
import { useHoverSegmentationInstance } from "@/lib/store";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuGroup,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./ui/context-menu";
import { TrashIcon } from "lucide-react";

interface SegmentInstanceProps {
  instance: Instance;
  segmentationId: string;
  instanceIndex: number;
}

export function SegmentInstance({
  instance,
  segmentationId,
  instanceIndex,
}: SegmentInstanceProps) {
  const labels = useAllLabels();
  const {
    segmentationId: hoveredSegmentationId,
    instanceIndex: hoveredInstanceIndex,
    setHover,
    clearHover,
  } = useHoverSegmentationInstance();
  const currentImageId = useCurrentImageId()[0];
  const { setSegmentLabel } = useSegmentationActions();

  const color = labels[instance.label as keyof typeof labels] || "#6b7280";
  const isHovered =
    hoveredSegmentationId === segmentationId &&
    hoveredInstanceIndex === instanceIndex;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Badge
          variant="secondary"
          style={{
            backgroundColor: color + "20",
            color: color,
            borderColor: color,
            borderWidth: isHovered ? 2 : 1,
          }}
          className="border"
          onMouseEnter={() => setHover(segmentationId, instanceIndex)}
          onMouseLeave={clearHover}
          title="Right click for more options"
        >
          {instance.label}
        </Badge>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem variant="destructive">
          <TrashIcon /> Delete
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Re-label</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuGroup>
              {Object.entries(labels)
                .filter(([label]) => label !== instance.label)
                .map(([label, color]) => (
                  <ContextMenuItem
                    key={label}
                    onClick={() => {
                      setSegmentLabel({
                        params: {
                          path: {
                            image_id: currentImageId!,
                            segmentation_id: segmentationId,
                            instance_idx: instanceIndex,
                            label: label,
                          },
                        },
                      });
                    }}
                  >
                    <span
                      className="inline-block w-3 h-3 mr-2 rounded-full"
                      style={{ backgroundColor: color }}
                    ></span>
                    {label}
                  </ContextMenuItem>
                ))}
            </ContextMenuGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}

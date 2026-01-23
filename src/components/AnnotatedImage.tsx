import {
  type Instance,
  type Segmentation,
  useAllLabels,
} from "@/hooks/streetscapes";
import {
  useHoverSegmentationInstance,
  useAnnotationVisibility,
} from "@/lib/store";
import {
  Annotorious,
  type ImageAnnotation,
  useAnnotator,
  type Color,
  type DrawingStyle,
  ImageAnnotator,
  UserSelectAction,
  ShapeType,
  type AnnotoriousImageAnnotator,
  type Polygon,
  useHover,
} from "@annotorious/react";
import { useEffect, useState } from "react";

import "@annotorious/react/annotorious-react.css";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { LabelVisibilityMenu } from "./LabelVisibilityMenu";

export function AnnotatedImage({
  id,
  url,
  segmentations,
}: {
  id: string;
  url: string;
  segmentations: Segmentation[];
}) {
  return (
    <Annotorious>
      <RealAnnotatedImage url={url} id={id} segmentations={segmentations} />
    </Annotorious>
  );
}
function mapSegmentationsToAnnotations(
  segmentations: Segmentation[],
): ImageAnnotation[] {
  return segmentations.flatMap((segmentation, segmentationIndex) =>
    (segmentation.instances ?? []).map((instance, instanceIndex) => {
      const id = [
        "seg",
        segmentation.id,
        segmentationIndex,
        instance.label,
        instanceIndex,
      ].join(":");

      const allPoints = (instance.polygon ?? []).flat();
      const xs = allPoints.map(([x]) => x);
      const ys = allPoints.map(([, y]) => y);

      // TODO calculate bound on server
      const overallBounds = {
        minX: Math.min(...xs),
        minY: Math.min(...ys),
        maxX: Math.max(...xs),
        maxY: Math.max(...ys),
      };

      const polygons = (instance.polygon ?? []).map((ring) => {
        const ringXs = ring.map(([x]) => x);
        const ringYs = ring.map(([, y]) => y);

        const bounds = {
          minX: Math.min(...ringXs),
          minY: Math.min(...ringYs),
          maxX: Math.max(...ringXs),
          maxY: Math.max(...ringYs),
        };

        return {
          rings: [
            {
              points: ring,
            },
          ],
          bounds,
        };
      });

      return {
        id,
        target: {
          annotation: id,
          selector: {
            type: ShapeType.MULTIPOLYGON,
            geometry: {
              bounds: overallBounds,
              polygons,
            },
          },
        },
        bodies: [
          {
            id: `${id}-label`,
            purpose: "tagging",
            annotation: id,
            value: instance.label,
          },
          {
            id: `${id}-segmentation`,
            purpose: "linking",
            annotation: id,
            value: segmentation.id,
          },
        ],
      };
    }),
  );
}

function parseAnnotationId(annotationId: string) {
  const parts = annotationId.split(":");
  if (parts.length < 5) return null;

  const instanceIndex = Number(parts[parts.length - 1]);
  if (Number.isNaN(instanceIndex)) return null;

  return {
    segmentationId: parts[1],
    instanceIndex,
  } as const;
}

function mapAnnotationToInstance(
  label: string,
  annotation: ImageAnnotation,
): Instance {
  if (annotation.target.selector.type !== ShapeType.POLYGON) {
    throw new Error("Only support polygon");
  }
  const g = annotation.target.selector as Polygon;
  return {
    label,
    polygon: [g.geometry.points as [number, number][]],
  };
}

function LabelToDraw({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const allLabels = useAllLabels();
  return (
    <Label title="Label of drawn segment, create new segment by dragging in image">
      <Select value={value} onValueChange={(v) => onChange(v!)}>
        <SelectTrigger className="w-full max-w-48">
          <SelectValue
            placeholder="Select a fruit"
            style={{ color: allLabels[value] }}
          >
            Draw {value}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Label</SelectLabel>
            {Object.entries(allLabels).map(([label, color]) => (
              <SelectItem
                key={label}
                style={{
                  color,
                }}
                value={label}
              >
                Draw {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Label>
  );
}

function RealAnnotatedImage({
  url,
  id,
  segmentations,
}: {
  url: string;
  id: string;
  segmentations: Segmentation[];
}) {
  const allLabels = useAllLabels();
  const annot = useAnnotator<AnnotoriousImageAnnotator>();
  const [drawLabel, setDrawLabel] = useState(Object.keys(allLabels)[0]);
  const hoveredAnnotation = useHover();
  const annotations = mapSegmentationsToAnnotations(segmentations);
  const {
    segmentationId: hoveredSegmentationId,
    instanceIndex: hoveredInstanceIndex,
    setHover,
    clearHover,
  } = useHoverSegmentationInstance();
  const { hiddenSegmentations, hiddenLabels } = useAnnotationVisibility();

  // Filter annotations based on visibility state
  const visibleAnnotations = annotations.filter((annotation) => {
    const segmentationId = annotation.bodies.find(
      (b) => b.purpose === "linking",
    )?.value as string;
    const label = annotation.bodies.find((b) => b.purpose === "tagging")
      ?.value as string;

    const isSegmentationHidden = hiddenSegmentations.has(segmentationId);
    const isLabelHidden = hiddenLabels.has(label);

    return !isSegmentationHidden && !isLabelHidden;
  });

  useEffect(() => {
    if (!hoveredAnnotation) {
      clearHover();
      return;
    }

    const parsed = parseAnnotationId(hoveredAnnotation.id);
    if (parsed) {
      setHover(parsed.segmentationId, parsed.instanceIndex);
    } else {
      clearHover();
    }
  }, [hoveredAnnotation, setHover, clearHover]);

  useEffect(() => {
    if (!annot) return;
    annot.on("createAnnotation", annotationCreated);
    function annotationCreated(a: ImageAnnotation) {
      const defaultManualSegmentation: Segmentation = {
        model_name: "manual",
        id: "<manual>",
        run_args: "",
        instances: [],
        notes: "",
      };
      const manualSegmentation =
        segmentations.find((s) => s.model_name === "manual") ??
        defaultManualSegmentation;
      manualSegmentation.instances!.push(mapAnnotationToInstance(drawLabel, a));
      console.log(JSON.stringify(manualSegmentation, undefined, 2));
      // TODO write to server
    }
    return () => {
      annot.off("createAnnotation", annotationCreated);
    };
  }, [annot, drawLabel, segmentations]);

  useEffect(() => {
    if (!annot || annot.getAnnotations().length == visibleAnnotations.length)
      return;
    annot.setAnnotations(visibleAnnotations);
  }, [annot, visibleAnnotations]);

  const annotaterStyle = (
    annotation: ImageAnnotation,
    // state?: AnnotationState,
  ) => {
    const label = annotation.bodies.find((b) => b.purpose === "tagging")
      ?.value as string;
    const color: Color = (allLabels[label] || "#FF0000") as Color;
    const parsed = parseAnnotationId(annotation.id);
    const isHovered =
      parsed?.segmentationId === hoveredSegmentationId &&
      parsed?.instanceIndex === hoveredInstanceIndex;
    const style: DrawingStyle = {
      stroke: color,
      strokeWidth: isHovered ? 4 : 2,
      fill: color,
      fillOpacity: 0.3,
    };
    return style;
  };

  // TODO allow to add segment
  // TODO allow to edit segment
  // TODO add zoom support using openseadragon
  return (
    <>
      <div aria-label="Actions on image" className="flex gap-2">
        <LabelToDraw value={drawLabel} onChange={setDrawLabel} />
        <LabelVisibilityMenu />
      </div>
      <ImageAnnotator
        tool="polygon"
        drawingEnabled={true}
        // Must be EDIT otherwise second draw fails
        userSelectAction={UserSelectAction.EDIT}
        style={annotaterStyle}
      >
        <img
          src={url}
          alt={`Streetscape ${id}`}
          className="max-w-full max-h-[80vh] object-contain"
        />
      </ImageAnnotator>
    </>
  );
}

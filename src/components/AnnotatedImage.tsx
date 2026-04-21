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
  UserSelectAction,
  ShapeType,
  type AnnotoriousImageAnnotator,
  type Polygon,
  useHover,
  OpenSeadragonAnnotator,
  OpenSeadragonViewer,
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
import type { Options } from "openseadragon";

export function AnnotatedImage({
  id,
  width,
  height,
  url,
  segmentations,
}: {
  id: string;
  url: string;
  height: number;
  width: number;
  segmentations: Segmentation[];
}) {
  return (
    <Annotorious>
      <RealAnnotatedImage
        url={url}
        id={id}
        height={height}
        width={width}
        segmentations={segmentations}
      />
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
  // "seg:maskformer-2026-04-03T08:41:02.567:0:building:0"
  // ->
  // segmentationId = "maskformer-2026-04-03T08:41:02.567"
  // instanceIndex = 0
  // segmentationId aka segmentations.run column is user defined
  const parts = annotationId.split(":");
  const instanceIndex = parseInt(parts[parts.length - 1], 10);
  const segmentationId = parts.slice(1, -3).join(":");
  return {
    segmentationId,
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

function HoverInfo({
  activeHoveredAnnotation,
}: {
  activeHoveredAnnotation?: ImageAnnotation;
}) {
  return (
    <div className="flex h-8 flex-1 items-center rounded-lg border border-border px-3">
      {activeHoveredAnnotation ? (
        <span className="w-full truncate text-sm">
          {activeHoveredAnnotation.bodies
            .filter((b) => b.purpose === "tagging")
            .map((b) => String(b.value))
            .join(", ")}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">
          Shows segmentation label on image hover
        </span>
      )}
    </div>
  );
}

function RealAnnotatedImage({
  url,
  id,
  height,
  width,
  segmentations,
}: {
  url: string;
  id: string;
  height: number;
  width: number;
  segmentations: Segmentation[];
}) {
  const allLabels = useAllLabels();
  const annot = useAnnotator<AnnotoriousImageAnnotator>();
  const [drawLabel, setDrawLabel] = useState(Object.keys(allLabels)[0]);
  const [isPointerInImageArea, setIsPointerInImageArea] = useState(false);
  const hoveredAnnotation = useHover();
  const activeHoveredAnnotation = isPointerInImageArea
    ? hoveredAnnotation
    : undefined;
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
    if (!activeHoveredAnnotation) {
      clearHover();
      return;
    }

    const parsed = parseAnnotationId(activeHoveredAnnotation.id);
    if (parsed) {
      setHover(parsed.segmentationId, parsed.instanceIndex);
    } else {
      clearHover();
    }
  }, [activeHoveredAnnotation, setHover, clearHover]);

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
        rating: 0,
      };
      const manualSegmentation =
        segmentations.find((s) => s.model_name === "manual") ??
        defaultManualSegmentation;
      manualSegmentation.instances!.push(mapAnnotationToInstance(drawLabel, a));
      console.log(JSON.stringify(manualSegmentation, undefined, 2));
      // TODO write to server, see https://github.com/Urban-M4/Urban-M5/issues/4
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

  const options: Options = {
    tileSources: {
      type: "image",
      width,
      height,
      url,
    },
    maxZoomPixelRatio: 8,
    drawer: "canvas",
    // TODO use/create icons that match esthetics of rest of app
    prefixUrl: "http://openseadragon.github.io/openseadragon/images/",
  };

  return (
    <>
      <div aria-label="Actions on image" className="flex items-center gap-2">
        <LabelToDraw value={drawLabel} onChange={setDrawLabel} />
        <LabelVisibilityMenu />
        <HoverInfo activeHoveredAnnotation={activeHoveredAnnotation} />
      </div>
      <OpenSeadragonAnnotator
        tool="polygon"
        drawingEnabled={true}
        // Must be EDIT otherwise second draw fails
        userSelectAction={UserSelectAction.EDIT}
        style={annotaterStyle}
      >
        <div
          onMouseEnter={() => setIsPointerInImageArea(true)}
          onMouseLeave={() => {
            setIsPointerInImageArea(false);
            clearHover();
          }}
        >
          <OpenSeadragonViewer
            key={id}
            options={options}
            className="w-full max-h-[50vh] h-[40vh] min-h-[12vh]"
          />
        </div>
      </OpenSeadragonAnnotator>
    </>
  );
}

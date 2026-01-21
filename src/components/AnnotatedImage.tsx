import { type Segmentation, useAllLabels } from "@/hooks/streetscapes";
import {
  Annotorious,
  type ImageAnnotation,
  useAnnotator,
  type Color,
  type DrawingStyle,
  ImageAnnotator,
  UserSelectAction,
} from "@annotorious/react";
import { useEffect } from "react";

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
    segmentation.instances.map((instance, instanceIndex) => {
      const id = [
        "seg",
        segmentation.model_name,
        segmentationIndex,
        instance.label,
        instanceIndex,
      ].join(":");

      const allPoints = instance.polygon.flat();
      const xs = allPoints.map(([x]) => x);
      const ys = allPoints.map(([, y]) => y);

      // TODO calculate bound on server
      const overallBounds = {
        minX: Math.min(...xs),
        minY: Math.min(...ys),
        maxX: Math.max(...xs),
        maxY: Math.max(...ys),
      };

      const polygons = instance.polygon.map((ring) => {
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
            type: "MULTIPOLYGON",
            geometry: {
              bounds: overallBounds,
              polygons,
            },
          },
        },
        bodies: [
          {
            id: `${id}-label`,
            annotation: id,
            purpose: "tagging",
            value: instance.label,
          },
        ],
        properties: {
          modelName: segmentation.model_name,
          runArgs: segmentation.run_args,
          segmentationNotes: segmentation.notes,
        },
      } as ImageAnnotation;
    }),
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
  const allLabel = useAllLabels();
  const annot = useAnnotator();
  useEffect(() => {
    if (!annot) return;

    const annotations = mapSegmentationsToAnnotations(segmentations);
    annot.setAnnotations(annotations);
  }, [annot, segmentations]);

  const annotaterStyle = (
    annotation: ImageAnnotation,
    // state?: AnnotationState,
  ) => {
    const label = annotation.bodies.find((b) => b.purpose === "tagging")
      ?.value as string;
    const color: Color = (allLabel[label] || "#FF0000") as Color;
    const style: DrawingStyle = {
      stroke: color,
      strokeWidth: 2,
      fill: color,
      fillOpacity: 0.3,
    };
    return style;
  };

  // TODO allow to add segment
  // TODO allow to edit segment
  // TODO add zoom support using openseadragon
  return (
    <ImageAnnotator
      tool="polygon"
      drawingEnabled={false}
      userSelectAction={UserSelectAction.NONE}
      style={annotaterStyle}
    >
      <img src={url} alt={`Streetscape ${id}`} className="max-w-full h-auto" />
    </ImageAnnotator>
  );
}

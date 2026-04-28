import { ScanEyeIcon } from "lucide-react";
import { useMap } from "react-map-gl/maplibre";
import { Button } from "./ui/button";

type Images = {
  id: string;
  url: string;
  lat: number;
  lon: number;
}[];

function boundingBoxOfImages(images: Images) {
  if (images.length === 0) return null;

  const bbox = images.reduce(
    (acc, img) => {
      const { lat, lon } = img;
      if (lat < acc[0]) acc[0] = lat;
      if (lat > acc[2]) acc[2] = lat;
      if (lon < acc[1]) acc[1] = lon;
      if (lon > acc[3]) acc[3] = lon;
      return acc;
    },
    [Infinity, Infinity, -Infinity, -Infinity],
  );

  return [
    [bbox[1], bbox[0]],
    [bbox[3], bbox[2]],
  ] as [[number, number], [number, number]];
}

export function ZoomToImagesControl({ images }: { images: Images }) {
  const map = useMap();

  return (
    <Button
      onClick={() => {
        const bounds = boundingBoxOfImages(images);
        if (bounds) {
          map.current?.fitBounds(bounds, { padding: 40, speed: 10 });
        }
      }}
      title="Zoom to all images"
      size="icon"
      variant="outline"
      // top-36 positions button below the maplibre builtin controls
      className="absolute top-36 left-2 border-2 rounded-sm"
    >
      <ScanEyeIcon />
    </Button>
  );
}

import Map, {
  Layer,
  Source,
  type MapLayerMouseEvent,
  type MapRef,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { useCurrentImageId, useGetImages } from "@/hooks/streetscapes";
import { useTheme } from "@/components/theme-provider";
import { useEffect, useRef } from "react";

export function MapPanel() {
  const [currentImageId, setCurrentImageId] = useCurrentImageId();
  const { theme } = useTheme();
  const mapRef = useRef<MapRef | null>(null);
  const { data: images } = useGetImages();

  const mapStyle =
    theme === "dark"
      ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

  // MapLibre forces id to number, while image id are strings
  const imageLookup: Record<string, number> = Object.fromEntries(
    images.map((img, index) => [img.id, index]),
  );

  const geojson = {
    type: "FeatureCollection" as const,
    features: images?.map((img) => ({
      type: "Feature" as const,
      id: imageLookup[img.id],
      properties: {
        id: img.id,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [img.longitude, img.latitude],
      },
    })),
  };

  useEffect(() => {
    if (!mapRef.current) return;

    images.forEach((image) => {
      mapRef.current?.setFeatureState(
        { source: "images", id: imageLookup[image.id] },
        { selected: image.id === currentImageId },
      );
    });
  }, [currentImageId, images, imageLookup]);

  function handleClick(event: MapLayerMouseEvent) {
    if (!mapRef.current) return;

    const features = mapRef.current.queryRenderedFeatures(event.point, {
      layers: ["images"],
    });
    if (features.length > 0) {
      const feature = features[0];
      console.log(feature);
      setCurrentImageId(feature.properties.id);
    }
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 5,
          latitude: 52,
          zoom: 8,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        onClick={handleClick}
      >
        <Source id="images" type="geojson" data={geojson}>
          <Layer
            id="images"
            type="circle"
            paint={{
              "circle-radius": 8,
              "circle-color": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                "#007cbf",
                "rgba(0,0,0,0)",
              ],
              "circle-stroke-width": 8,
              "circle-stroke-color": "#007cbf",
            }}
          />
        </Source>
      </Map>
    </div>
  );
}

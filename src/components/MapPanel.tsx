import Map, {
  FullscreenControl,
  Layer,
  NavigationControl,
  ScaleControl,
  Source,
  type MapGeoJSONFeature,
  type MapLayerMouseEvent,
  type MapRef,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { useCurrentImageId, useGetImages } from "@/hooks/streetscapes";
import { useTheme } from "@/components/theme-provider";
import { useCallback, useEffect, useRef, useState } from "react";

export function MapPanel() {
  const [currentImageId, setCurrentImageId] = useCurrentImageId();
  const { theme } = useTheme();
  const mapRef = useRef<MapRef | null>(null);
  const { data: images } = useGetImages();
  const [hoverInfo, setHoverInfo] = useState<{
    feature: MapGeoJSONFeature;
    x: number;
    y: number;
  } | null>(null);

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
        url: img.url,
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
      // TODO handle/complain when multiple features
      const feature = features[0];
      setCurrentImageId(feature.properties.id);
    }
  }

  const onHover = useCallback((event: MapLayerMouseEvent) => {
    const {
      features,
      point: { x, y },
    } = event;
    const hoveredFeature = features && features[0];
    // TODO handle/complain when multiple features

    setHoverInfo(hoveredFeature ? { feature: hoveredFeature, x, y } : null);
  }, []);

  // TODO use clustering see https://visgl.github.io/react-map-gl/examples/maplibre/clusters
  return (
    <div className="relative overflow-hidden h-full w-full">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 5,
          latitude: 52,
          zoom: 8,
        }}
        className="h-full w-full"
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        onClick={handleClick}
        onMouseMove={onHover}
        interactiveLayerIds={["images"]}
      >
        {/* TODO add control to zoom to fit all points */}
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />
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
        {hoverInfo && (
          <div
            className="absolute pointer-events-none bg-white dark:bg-gray-800 p-2 rounded shadow-lg border border-gray-200 dark:border-gray-700"
            style={{
              left: hoverInfo.x + 10,
              top: hoverInfo.y + 10,
            }}
          >
            <img
              src={hoverInfo.feature.properties.url}
              alt="Street view thumbnail"
              className="w-32 h-32 object-cover rounded"
            />
          </div>
        )}
      </Map>
    </div>
  );
}

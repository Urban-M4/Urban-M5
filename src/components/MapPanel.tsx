import Map, {
  Layer,
  Source,
  type MapLayerMouseEvent,
  type MapRef,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { useCurrentImageId, useGetImages } from "@/hooks/streetscapes";
import { useRef } from "react";

export function MapPanel() {
  const [currentImageId, setCurrentImageId] = useCurrentImageId();
  const mapRef = useRef<MapRef | null>(null);
  const { data: images } = useGetImages();
  const geojson = {
    type: "FeatureCollection" as const,
    features: images?.map((img) => ({
      type: "Feature" as const,
      id: img.id,
      properties: {
        id: img.id,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [img.longitude, img.latitude],
      },
    })),
  };

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
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        onClick={handleClick}
      >
        <Source id="images" type="geojson" data={geojson}>
          <Layer
            id="images"
            type="circle"
            paint={{ "circle-radius": 10, "circle-color": "#007cbf" }}
          />
        </Source>
      </Map>
    </div>
  );
}

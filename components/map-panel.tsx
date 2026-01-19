"use client"

import React, { useEffect, useMemo, useRef } from "react"
import { Map, Source, Layer } from "@vis.gl/react-maplibre"
import { useStore } from "@/lib/store"
import { SCORE_HEX } from "@/lib/types"
import { PanelHeader } from "./panel-header"

export function MapPanel() {
  const mapRef = useRef(null)
  const { images, selectedImageId, selectImage, scoreFilter } = useStore()

  const filteredImages = images.filter(
    img => img.qualityScore >= scoreFilter.min && img.qualityScore <= scoreFilter.max
  )

  // Calculate bounds
  const calculateBounds = () => {
    if (filteredImages.length === 0) return null

    const lats = filteredImages.map(img => img.lat)
    const lngs = filteredImages.map(img => img.lng)
    const minLat = Math.min(...lats) - 2
    const maxLat = Math.max(...lats) + 2
    const minLng = Math.min(...lngs) - 5
    const maxLng = Math.max(...lngs) + 5

    return [[minLng, minLat], [maxLng, maxLat]] as [[number, number], [number, number]]
  }

  const bounds = calculateBounds()
  const imageLookup: Record<string, number> = useMemo(() => Object.fromEntries(images.map(img => [img.id, Number(img.id.replace('img-', ''))])), [images])

  // Update feature state for selected marker
  useEffect(() => {
    if (!mapRef.current) return

    filteredImages.forEach((image) => {
      mapRef.current.setFeatureState(
        { source: "image-markers", id: imageLookup[image.id] },
        { selected: image.id === selectedImageId }
      )
    })
  }, [selectedImageId, filteredImages])

  // Create GeoJSON from filtered images
  const geojson = {
    type: "FeatureCollection" as const,
    features: filteredImages.map(img => ({
      type: "Feature" as const,
      id: imageLookup[img.id],
      properties: {
        qualityScore: img.qualityScore,
        name: img.name,
        id: img.id,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [img.lng, img.lat],
      },
    })),
  }

  const handleMapClick = (e: any) => {
    if (!mapRef.current) return

    const features = mapRef.current.queryRenderedFeatures(e.point, {
      layers: ["map-markers"],
    })

    if (features.length > 0) {
      const feature = features[0]
      selectImage(`img-${feature.id}`)
    }
  }

  if (!bounds) {
    return (
      <div className="flex flex-col h-full bg-card">
        <PanelHeader title="Map View">
          <span className="text-xs text-muted-foreground">0 locations</span>
        </PanelHeader>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          No images to display
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-card">
      <PanelHeader title="Map View">
        <span className="text-xs text-muted-foreground">
          {filteredImages.length} locations
        </span>
      </PanelHeader>
      <div className="flex-1 relative overflow-hidden">
        <Map
          ref={mapRef}
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          initialViewState={{
            bounds,
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
          }}
          onClick={handleMapClick}
          style={{ width: "100%", height: "100%" }}
        >
          <Source id="image-markers" type="geojson" data={geojson}>
            <Layer
              id="map-markers"
              type="circle"
              paint={{
                "circle-radius": [
                  "case",
                  ["boolean", ["feature-state", "selected"], false],
                  10,
                  7,
                ],
                "circle-color": [
                  "case",
                  ["==", ["get", "qualityScore"], 1],
                  SCORE_HEX[1],
                  ["==", ["get", "qualityScore"], 2],
                  SCORE_HEX[2],
                  ["==", ["get", "qualityScore"], 3],
                  SCORE_HEX[3],
                  ["==", ["get", "qualityScore"], 4],
                  SCORE_HEX[4],
                  ["==", ["get", "qualityScore"], 5],
                  SCORE_HEX[5],
                  SCORE_HEX[3],
                ],
                "circle-stroke-width": [
                  "case",
                  ["boolean", ["feature-state", "selected"], false],
                  3,
                  1,
                ],
                "circle-stroke-color": [
                  "case",
                  ["boolean", ["feature-state", "selected"], false],
                  "#fff",
                  "#000",
                ],
              }}
            />
          </Source>
        </Map>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-black/50 rounded px-3 py-2 text-xs text-slate-400 pointer-events-none">
          <div className="mb-2">Score:</div>
          <div className="flex gap-2">
            {Object.entries(SCORE_HEX).map(([score, color]) => (
              <div key={score} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="font-bold text-white">{score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

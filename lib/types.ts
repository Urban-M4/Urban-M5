export type SegmentClass = "car" | "building" | "plant" | "people"

export const SEGMENT_CLASSES: SegmentClass[] = ["car", "building", "plant", "people"]

export interface Point {
  x: number
  y: number
}

export interface Segment {
  id: string
  imageId: string
  class: SegmentClass
  polygon: Point[]
  qualityScore: number // 1-5
  area?: number
}

export interface GeocodedImage {
  id: string
  url: string
  lat: number
  lng: number
  qualityScore: number // 1-5
  segments: Segment[]
  name: string
  capturedAt: string
}

export type OverlayMode = "filled" | "border" | "hidden" | "mask"

export interface AppState {
  images: GeocodedImage[]
  selectedImageId: string | null
  selectedSegmentId: string | null
  visibleClasses: SegmentClass[]
  overlayMode: OverlayMode
  scoreFilter: number | null
  isDrawing: boolean
  drawingPoints: Point[]
  shrinkMode: boolean
}

export const CLASS_COLORS: Record<SegmentClass, string> = {
  car: "var(--color-car)",
  building: "var(--color-building)",
  plant: "var(--color-plant)",
  people: "var(--color-people)",
}

export const CLASS_RGB: Record<SegmentClass, [number, number, number]> = {
  car: [96, 165, 250],
  building: [251, 191, 36],
  plant: [74, 222, 128],
  people: [251, 113, 133],
}

export const SCORE_COLORS: Record<number, string> = {
  1: "var(--score-1)",
  2: "var(--score-2)",
  3: "var(--score-3)",
  4: "var(--score-4)",
  5: "var(--score-5)",
}

export const SCORE_HEX: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#22c55e",
  5: "#14b8a6",
}

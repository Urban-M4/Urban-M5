"use client"

import { create } from "zustand"
import type { GeocodedImage, Segment, SegmentClass, OverlayMode, Point } from "./types"

interface ScoreFilter {
  min: number
  max: number
}

interface AppStore {
  images: GeocodedImage[]
  selectedImageId: string | null
  selectedSegmentId: string | null
  visibleClasses: SegmentClass[]
  overlayMode: OverlayMode
  scoreFilter: ScoreFilter
  isDrawing: boolean
  drawingPoints: Point[]
  shrinkMode: boolean
  newSegmentClass: SegmentClass
  drawingMode: "draw" | "subtract" | null
  
  // Panel sizes (percentages)
  horizontalSplit: number
  verticalSplitTop: number
  verticalSplitBottom: number
  
  // Actions
  setImages: (images: GeocodedImage[]) => void
  selectImage: (id: string | null) => void
  selectSegment: (id: string | null) => void
  toggleClass: (cls: SegmentClass) => void
  setOverlayMode: (mode: OverlayMode) => void
  setScoreFilter: (filter: ScoreFilter) => void
  updateImageScore: (imageId: string, score: number) => void
  updateSegmentScore: (segmentId: string, score: number) => void
  updateSegmentClass: (segmentId: string, cls: SegmentClass) => void
  startDrawing: () => void
  addDrawingPoint: (point: Point) => void
  finishDrawing: () => void
  cancelDrawing: () => void
  toggleShrinkMode: () => void
  setNewSegmentClass: (cls: SegmentClass) => void
  setDrawingMode: (mode: "draw" | "subtract" | null) => void
  setSplits: (horizontal: number, verticalTop: number, verticalBottom: number) => void
  setHorizontalSplit: (value: number) => void
  setVerticalSplitTop: (value: number) => void
  setVerticalSplitBottom: (value: number) => void
  navigateToNextImage: () => void
  navigateToPreviousImage: () => void
  deleteSegment: (segmentId: string) => void
}

// Generate sample data
const generateSampleData = (): GeocodedImage[] => {
  const classes: SegmentClass[] = ["car", "building", "plant", "people"]
  const images: GeocodedImage[] = []
  
  const locations = [
    { lat: 40.7128, lng: -74.006, name: "New York City" },
    { lat: 34.0522, lng: -118.2437, name: "Los Angeles" },
    { lat: 41.8781, lng: -87.6298, name: "Chicago" },
    { lat: 29.7604, lng: -95.3698, name: "Houston" },
    { lat: 33.749, lng: -84.388, name: "Atlanta" },
    { lat: 47.6062, lng: -122.3321, name: "Seattle" },
    { lat: 25.7617, lng: -80.1918, name: "Miami" },
    { lat: 39.7392, lng: -104.9903, name: "Denver" },
    { lat: 37.7749, lng: -122.4194, name: "San Francisco" },
    { lat: 42.3601, lng: -71.0589, name: "Boston" },
  ]
  
  for (let i = 0; i < 10; i++) {
    const loc = locations[i]
    const segments: Segment[] = []
    const segmentCount = Math.floor(Math.random() * 5) + 2
    
    for (let j = 0; j < segmentCount; j++) {
      const cls = classes[Math.floor(Math.random() * classes.length)]
      const centerX = 50 + Math.random() * 300
      const centerY = 50 + Math.random() * 200
      const size = 30 + Math.random() * 50
      
      segments.push({
        id: `seg-${i}-${j}`,
        imageId: `img-${i}`,
        class: cls,
        polygon: [
          { x: centerX, y: centerY - size },
          { x: centerX + size, y: centerY - size / 2 },
          { x: centerX + size, y: centerY + size / 2 },
          { x: centerX, y: centerY + size },
          { x: centerX - size, y: centerY + size / 2 },
          { x: centerX - size, y: centerY - size / 2 },
        ],
        qualityScore: Math.floor(Math.random() * 5) + 1,
      })
    }
    
    images.push({
      id: `img-${i}`,
      url: `https://picsum.photos/seed/${i + 100}/800/600`,
      lat: loc.lat + (Math.random() - 0.5) * 0.1,
      lng: loc.lng + (Math.random() - 0.5) * 0.1,
      qualityScore: Math.floor(Math.random() * 5) + 1,
      segments,
      name: `${loc.name} - Image ${i + 1}`,
      capturedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }
  
  return images
}

// Helper to check if polygons overlap
const polygonsOverlap = (poly1: Point[], poly2: Point[]): boolean => {
  // Simple bounding box check first
  const getBounds = (poly: Point[]) => {
    const xs = poly.map(p => p.x)
    const ys = poly.map(p => p.y)
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    }
  }
  
  const b1 = getBounds(poly1)
  const b2 = getBounds(poly2)
  
  return !(b1.maxX < b2.minX || b1.minX > b2.maxX || b1.maxY < b2.minY || b1.minY > b2.maxY)
}

// Shrink polygon away from another polygon
const shrinkPolygonFromAnother = (toShrink: Point[], avoid: Point[]): Point[] => {
  const getCenter = (poly: Point[]) => ({
    x: poly.reduce((sum, p) => sum + p.x, 0) / poly.length,
    y: poly.reduce((sum, p) => sum + p.y, 0) / poly.length,
  })
  
  const avoidCenter = getCenter(avoid)
  const shrinkCenter = getCenter(toShrink)
  
  // Direction from avoid to shrink
  const dx = shrinkCenter.x - avoidCenter.x
  const dy = shrinkCenter.y - avoidCenter.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  
  if (dist === 0) return toShrink
  
  // Move points away and scale down
  return toShrink.map(p => {
    const toCenterX = shrinkCenter.x - p.x
    const toCenterY = shrinkCenter.y - p.y
    
    return {
      x: p.x + toCenterX * 0.2 + (dx / dist) * 10,
      y: p.y + toCenterY * 0.2 + (dy / dist) * 10,
    }
  })
}

export const useStore = create<AppStore>((set, get) => ({
  images: generateSampleData(),
  selectedImageId: "img-0",
  selectedSegmentId: null,
  visibleClasses: ["car", "building", "plant", "people"],
  overlayMode: "filled",
  scoreFilter: { min: 1, max: 5 },
  isDrawing: false,
  drawingPoints: [],
  shrinkMode: false,
  newSegmentClass: "car",
  drawingMode: null,
  horizontalSplit: 50,
  verticalSplitTop: 50,
  verticalSplitBottom: 50,
  
  setImages: (images) => set({ images }),
  
  selectImage: (id) => set({ selectedImageId: id, selectedSegmentId: null }),
  
  selectSegment: (id) => set({ selectedSegmentId: id }),
  
  toggleClass: (cls) => set((state) => ({
    visibleClasses: state.visibleClasses.includes(cls)
      ? state.visibleClasses.filter((c) => c !== cls)
      : [...state.visibleClasses, cls],
  })),
  
  setOverlayMode: (mode) => set({ overlayMode: mode }),
  
  setScoreFilter: (filter) => set({ scoreFilter: filter }),
  
  updateImageScore: (imageId, score) => set((state) => ({
    images: state.images.map((img) =>
      img.id === imageId ? { ...img, qualityScore: score } : img
    ),
  })),
  
  updateSegmentScore: (segmentId, score) => set((state) => ({
    images: state.images.map((img) => ({
      ...img,
      segments: img.segments.map((seg) =>
        seg.id === segmentId ? { ...seg, qualityScore: score } : seg
      ),
    })),
  })),
  
  updateSegmentClass: (segmentId, cls) => set((state) => ({
    images: state.images.map((img) => ({
      ...img,
      segments: img.segments.map((seg) =>
        seg.id === segmentId ? { ...seg, class: cls } : seg
      ),
    })),
  })),
  
  setDrawingMode: (mode) => set({ drawingMode: mode, isDrawing: mode === "draw", drawingPoints: [] }),
  
  startDrawing: () => set({ isDrawing: true, drawingPoints: [] }),
  
  addDrawingPoint: (point) => set((state) => ({
    drawingPoints: [...state.drawingPoints, point],
  })),
  
  finishDrawing: () => {
    const state = get()
    if (state.drawingPoints.length < 3) {
      set({ isDrawing: false, drawingPoints: [] })
      return
    }
    
    const selectedImage = state.images.find((img) => img.id === state.selectedImageId)
    if (!selectedImage) {
      set({ isDrawing: false, drawingPoints: [] })
      return
    }
    
    const newSegment: Segment = {
      id: `seg-${Date.now()}`,
      imageId: selectedImage.id,
      class: state.newSegmentClass,
      polygon: state.drawingPoints,
      qualityScore: 3,
    }
    
    let updatedSegments = [...selectedImage.segments]
    
    // If shrink mode is enabled, shrink overlapping segments
    if (state.shrinkMode) {
      updatedSegments = updatedSegments.map((seg) => {
        if (polygonsOverlap(seg.polygon, newSegment.polygon)) {
          return {
            ...seg,
            polygon: shrinkPolygonFromAnother(seg.polygon, newSegment.polygon),
          }
        }
        return seg
      })
    }
    
    updatedSegments.push(newSegment)
    
    set({
      images: state.images.map((img) =>
        img.id === selectedImage.id ? { ...img, segments: updatedSegments } : img
      ),
      isDrawing: false,
      drawingPoints: [],
      selectedSegmentId: newSegment.id,
    })
  },
  
  cancelDrawing: () => set({ isDrawing: false, drawingPoints: [] }),
  
  toggleShrinkMode: () => set((state) => ({ shrinkMode: !state.shrinkMode })),
  
  setNewSegmentClass: (cls) => set({ newSegmentClass: cls }),
  
  setSplits: (horizontal, verticalTop, verticalBottom) => set({
    horizontalSplit: horizontal,
    verticalSplitTop: verticalTop,
    verticalSplitBottom: verticalBottom,
  }),
  
  setHorizontalSplit: (value) => set({ horizontalSplit: value }),
  setVerticalSplitTop: (value) => set({ verticalSplitTop: value }),
  setVerticalSplitBottom: (value) => set({ verticalSplitBottom: value }),
  
  navigateToNextImage: () => {
    const state = get()
    const filteredImages = state.images.filter(
      (img) => img.qualityScore >= state.scoreFilter.min && img.qualityScore <= state.scoreFilter.max
    )
    
    const currentIndex = filteredImages.findIndex((img) => img.id === state.selectedImageId)
    const nextIndex = (currentIndex + 1) % filteredImages.length
    set({ selectedImageId: filteredImages[nextIndex]?.id ?? null, selectedSegmentId: null })
  },
  
  navigateToPreviousImage: () => {
    const state = get()
    const filteredImages = state.images.filter(
      (img) => img.qualityScore >= state.scoreFilter.min && img.qualityScore <= state.scoreFilter.max
    )
    
    const currentIndex = filteredImages.findIndex((img) => img.id === state.selectedImageId)
    const prevIndex = currentIndex <= 0 ? filteredImages.length - 1 : currentIndex - 1
    set({ selectedImageId: filteredImages[prevIndex]?.id ?? null, selectedSegmentId: null })
  },
  
  deleteSegment: (segmentId) => set((state) => ({
    images: state.images.map((img) => ({
      ...img,
      segments: img.segments.filter((seg) => seg.id !== segmentId),
    })),
    selectedSegmentId: state.selectedSegmentId === segmentId ? null : state.selectedSegmentId,
  })),
}))

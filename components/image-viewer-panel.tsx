"use client"

import React, { useCallback, useEffect, useState, useRef } from "react"
import { useStore } from "@/lib/store"
import { CLASS_RGB, SEGMENT_CLASSES, type SegmentClass } from "@/lib/types"
import { PanelHeader } from "./panel-header"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function ImageViewerPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const {
    images,
    selectedImageId,
    selectedSegmentId,
    visibleClasses,
    overlayMode,
    isDrawing,
    drawingPoints,
    shrinkMode,
    newSegmentClass,
    toggleClass,
    setOverlayMode,
    startDrawing,
    addDrawingPoint,
    finishDrawing,
    cancelDrawing,
    toggleShrinkMode,
    setNewSegmentClass,
    selectSegment,
    navigateToNextImage,
    navigateToPreviousImage,
  } = useStore()
  
  const selectedImage = images.find(img => img.id === selectedImageId)
  
  // Load image
  useEffect(() => {
    if (!selectedImage) return
    
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
    }
    img.src = selectedImage.url
    setImageLoaded(false)
  }, [selectedImage])
  
  // Resize observer
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const resizeObserver = new ResizeObserver(() => {
      const canvas = canvasRef.current
      if (canvas && container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    })
    
    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])
  
  // Redraw when dependencies change
  useEffect(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img || !selectedImage || !imageLoaded) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    // Clear
    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, width, height)
    
    // Calculate image fit
    const imgAspect = img.width / img.height
    const canvasAspect = width / height
    
    let drawWidth: number
    let drawHeight: number
    let offsetX: number
    let offsetY: number
    
    if (imgAspect > canvasAspect) {
      drawWidth = width
      drawHeight = width / imgAspect
      offsetX = 0
      offsetY = (height - drawHeight) / 2
    } else {
      drawHeight = height
      drawWidth = height * imgAspect
      offsetX = (width - drawWidth) / 2
      offsetY = 0
    }
    
    // Scale factor for segments
    const scaleX = drawWidth / img.width
    const scaleY = drawHeight / img.height
    
    const transformPoint = (x: number, y: number) => ({
      x: offsetX + x * scaleX,
      y: offsetY + y * scaleY,
    })
    
    // Draw image first for "hidden" mode
    if (overlayMode === "hidden") {
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
      if (isDrawing && drawingPoints.length > 0) {
        drawDrawingPolygon(ctx, transformPoint)
      }
      return
    }
    
    // For mask mode, create clipping
    if (overlayMode === "mask") {
      ctx.save()
      ctx.beginPath()
      
      const visibleSegments = selectedImage.segments.filter(
        seg => visibleClasses.includes(seg.class)
      )
      
      visibleSegments.forEach(segment => {
        if (segment.polygon.length < 3) return
        const first = transformPoint(segment.polygon[0].x, segment.polygon[0].y)
        ctx.moveTo(first.x, first.y)
        segment.polygon.slice(1).forEach(point => {
          const p = transformPoint(point.x, point.y)
          ctx.lineTo(p.x, p.y)
        })
        ctx.closePath()
      })
      
      ctx.clip()
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
      ctx.restore()
      
      visibleSegments.forEach(segment => {
        if (segment.polygon.length < 3) return
        const [r, g, b] = CLASS_RGB[segment.class]
        ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`
        ctx.lineWidth = segment.id === selectedSegmentId ? 3 : 1
        
        ctx.beginPath()
        const first = transformPoint(segment.polygon[0].x, segment.polygon[0].y)
        ctx.moveTo(first.x, first.y)
        segment.polygon.slice(1).forEach(point => {
          const p = transformPoint(point.x, point.y)
          ctx.lineTo(p.x, p.y)
        })
        ctx.closePath()
        ctx.stroke()
      })
    } else {
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
      
      const visibleSegments = selectedImage.segments.filter(
        seg => visibleClasses.includes(seg.class)
      )
      
      visibleSegments.forEach(segment => {
        if (segment.polygon.length < 3) return
        
        const [r, g, b] = CLASS_RGB[segment.class]
        const isSelected = segment.id === selectedSegmentId
        
        ctx.beginPath()
        const first = transformPoint(segment.polygon[0].x, segment.polygon[0].y)
        ctx.moveTo(first.x, first.y)
        segment.polygon.slice(1).forEach(point => {
          const p = transformPoint(point.x, point.y)
          ctx.lineTo(p.x, p.y)
        })
        ctx.closePath()
        
        if (overlayMode === "filled") {
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${isSelected ? 0.6 : 0.35})`
          ctx.fill()
        }
        
        ctx.strokeStyle = isSelected ? "#fff" : `rgb(${r}, ${g}, ${b})`
        ctx.lineWidth = isSelected ? 3 : 2
        ctx.stroke()
        
        if (isSelected) {
          const centerX = segment.polygon.reduce((sum, p) => sum + p.x, 0) / segment.polygon.length
          const centerY = segment.polygon.reduce((sum, p) => sum + p.y, 0) / segment.polygon.length
          const center = transformPoint(centerX, centerY)
          
          const text = segment.class.toUpperCase()
          ctx.font = "bold 12px sans-serif"
          const metrics = ctx.measureText(text)
          const padding = 4
          
          ctx.fillStyle = "#000"
          ctx.fillRect(
            center.x - metrics.width / 2 - padding,
            center.y - 8,
            metrics.width + padding * 2,
            16
          )
          
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(text, center.x, center.y)
        }
      })
    }
    
    if (isDrawing && drawingPoints.length > 0) {
      drawDrawingPolygon(ctx, transformPoint)
    }
    
    if (isDrawing) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(10, 10, 200, 30)
      ctx.fillStyle = "#22c55e"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`Drawing: ${newSegmentClass.toUpperCase()} - Click to add points`, 20, 28)
    }
    
    function drawDrawingPolygon(
      ctx: CanvasRenderingContext2D, 
      transformPoint: (x: number, y: number) => { x: number; y: number }
    ) {
      const [r, g, b] = CLASS_RGB[newSegmentClass]
      
      ctx.beginPath()
      const first = transformPoint(drawingPoints[0].x, drawingPoints[0].y)
      ctx.moveTo(first.x, first.y)
      
      drawingPoints.slice(1).forEach(point => {
        const p = transformPoint(point.x, point.y)
        ctx.lineTo(p.x, p.y)
      })
      
      if (drawingPoints.length > 2) {
        ctx.closePath()
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`
        ctx.fill()
      }
      
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.stroke()
      ctx.setLineDash([])
      
      drawingPoints.forEach((point, index) => {
        const p = transformPoint(point.x, point.y)
        ctx.beginPath()
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = index === 0 ? "#fff" : `rgb(${r}, ${g}, ${b})`
        ctx.fill()
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 1
        ctx.stroke()
      })
    }
  }, [imageLoaded, selectedImage, selectedSegmentId, visibleClasses, overlayMode, drawingPoints, isDrawing, newSegmentClass])
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img || !selectedImage) return
    
    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    
    const width = canvas.width
    const height = canvas.height
    
    const imgAspect = img.width / img.height
    const canvasAspect = width / height
    
    let drawWidth: number
    let drawHeight: number
    let offsetX: number
    let offsetY: number
    
    if (imgAspect > canvasAspect) {
      drawWidth = width
      drawHeight = width / imgAspect
      offsetX = 0
      offsetY = (height - drawHeight) / 2
    } else {
      drawHeight = height
      drawWidth = height * imgAspect
      offsetX = (width - drawWidth) / 2
      offsetY = 0
    }
    
    const imgX = ((clickX - offsetX) / drawWidth) * img.width
    const imgY = ((clickY - offsetY) / drawHeight) * img.height
    
    if (isDrawing) {
      if (drawingPoints.length > 2) {
        const firstPoint = drawingPoints[0]
        const distance = Math.sqrt((imgX - firstPoint.x) ** 2 + (imgY - firstPoint.y) ** 2)
        if (distance < 20) {
          finishDrawing()
          return
        }
      }
      addDrawingPoint({ x: imgX, y: imgY })
    } else {
      const visibleSegments = selectedImage.segments.filter(
        seg => visibleClasses.includes(seg.class)
      )
      
      for (const segment of visibleSegments) {
        if (isPointInPolygon({ x: imgX, y: imgY }, segment.polygon)) {
          selectSegment(segment.id)
          return
        }
      }
      
      selectSegment(null)
    }
  }
  
  const isPointInPolygon = (point: { x: number; y: number }, polygon: { x: number; y: number }[]) => {
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x
      const yi = polygon[i].y
      const xj = polygon[j].x
      const yj = polygon[j].y
      
      if (((yi > point.y) !== (yj > point.y)) && 
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside
      }
    }
    return inside
  }
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isDrawing) {
      if (e.key === "Escape") {
        cancelDrawing()
      } else if (e.key === "Enter" && drawingPoints.length >= 3) {
        finishDrawing()
      }
    }
  }, [isDrawing, drawingPoints, cancelDrawing, finishDrawing])
  
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
  
  if (!selectedImage) {
    return (
      <div className="flex flex-col h-full bg-card">
        <PanelHeader title="Image Viewer" />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Select an image to view
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col h-full bg-card">
      <PanelHeader title="Image Viewer">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 bg-transparent"
              onClick={navigateToPreviousImage}
              title="Previous (Left Arrow)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 bg-transparent"
              onClick={navigateToNextImage}
              title="Next (Right Arrow)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent">
                Classes ({visibleClasses.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SEGMENT_CLASSES.map(cls => (
                <DropdownMenuCheckboxItem
                  key={cls}
                  checked={visibleClasses.includes(cls)}
                  onCheckedChange={() => toggleClass(cls)}
                >
                  <span 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: `rgb(${CLASS_RGB[cls].join(",")})` }}
                  />
                  {cls.charAt(0).toUpperCase() + cls.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Select value={overlayMode} onValueChange={(v) => setOverlayMode(v as typeof overlayMode)}>
            <SelectTrigger className="w-24 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="filled">Filled</SelectItem>
              <SelectItem value="border">Border</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
              <SelectItem value="mask">Mask</SelectItem>
            </SelectContent>
          </Select>
          
          {!isDrawing ? (
            <>
              <Select value={newSegmentClass} onValueChange={(v) => setNewSegmentClass(v as SegmentClass)}>
                <SelectTrigger className="w-24 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEGMENT_CLASSES.map(cls => (
                    <SelectItem key={cls} value={cls}>
                      {cls.charAt(0).toUpperCase() + cls.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="default"
                size="sm"
                className="h-7 text-xs"
                onClick={startDrawing}
                title="Draw new segment (D)"
              >
                Draw
              </Button>
              
              <Button
                variant={shrinkMode ? "default" : "outline"}
                size="sm"
                className={cn("h-7 text-xs", !shrinkMode && "bg-transparent")}
                onClick={toggleShrinkMode}
                title="Shrink overlapping segments"
              >
                Shrink
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="default"
                size="sm"
                className="h-7 text-xs"
                onClick={finishDrawing}
                disabled={drawingPoints.length < 3}
              >
                Finish (Enter)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs bg-transparent"
                onClick={cancelDrawing}
              >
                Cancel (Esc)
              </Button>
            </>
          )}
        </div>
      </PanelHeader>
      
      <div ref={containerRef} className="flex-1 relative">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className={cn(
            "absolute inset-0",
            isDrawing ? "cursor-crosshair" : "cursor-pointer"
          )}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </div>
    </div>
  )
}

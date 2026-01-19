"use client"

import React, { useEffect, useRef } from "react"
import { useStore } from "@/lib/store"
import { SCORE_HEX } from "@/lib/types"
import { PanelHeader } from "./panel-header"

export function MapPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { images, selectedImageId, selectImage, scoreFilter } = useStore()
  
  const filteredImages = images.filter(
    img => img.qualityScore >= scoreFilter.min && img.qualityScore <= scoreFilter.max
  )
  
  // Calculate bounds
  const bounds = {
    minLat: Math.min(...filteredImages.map(img => img.lat)) - 2,
    maxLat: Math.max(...filteredImages.map(img => img.lat)) + 2,
    minLng: Math.min(...filteredImages.map(img => img.lng)) - 5,
    maxLng: Math.max(...filteredImages.map(img => img.lng)) + 5,
  }
  
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    
    const resizeObserver = new ResizeObserver(() => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      drawMap()
    })
    
    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])
  
  useEffect(() => {
    drawMap()
  }, [filteredImages, selectedImageId])
  
  const drawMap = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    // Clear
    ctx.fillStyle = "#0f172a"
    ctx.fillRect(0, 0, width, height)
    
    // Draw grid
    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 1
    
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
      
      const y = (i / 10) * height
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    // Draw US outline (simplified)
    ctx.strokeStyle = "#334155"
    ctx.lineWidth = 2
    ctx.beginPath()
    
    const toCanvas = (lat: number, lng: number) => ({
      x: ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width,
      y: height - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height,
    })
    
    // Draw markers
    filteredImages.forEach((image) => {
      const pos = toCanvas(image.lat, image.lng)
      const isSelected = image.id === selectedImageId
      const color = SCORE_HEX[image.qualityScore] || SCORE_HEX[3]
      
      // Outer glow for selected
      if (isSelected) {
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2)
        ctx.fillStyle = `${color}40`
        ctx.fill()
      }
      
      // Marker
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, isSelected ? 10 : 7, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      
      // Border
      ctx.strokeStyle = isSelected ? "#fff" : "#000"
      ctx.lineWidth = isSelected ? 3 : 1
      ctx.stroke()
      
      // Score indicator
      ctx.fillStyle = "#fff"
      ctx.font = "bold 10px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(String(image.qualityScore), pos.x, pos.y)
    })
    
    // Legend
    ctx.fillStyle = "#94a3b8"
    ctx.font = "11px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Score:", 10, height - 40)
    
    Object.entries(SCORE_HEX).forEach(([score, color], index) => {
      const x = 55 + index * 30
      ctx.beginPath()
      ctx.arc(x, height - 40, 8, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.fillStyle = "#fff"
      ctx.font = "bold 9px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(score, x, height - 40)
    })
  }
  
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const width = canvas.width
    const height = canvas.height
    
    // Find clicked marker
    for (const image of filteredImages) {
      const posX = ((image.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width
      const posY = height - ((image.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height
      
      const distance = Math.sqrt((x - posX) ** 2 + (y - posY) ** 2)
      if (distance < 15) {
        selectImage(image.id)
        return
      }
    }
  }
  
  return (
    <div className="flex flex-col h-full bg-card">
      <PanelHeader title="Map View">
        <span className="text-xs text-muted-foreground">
          {filteredImages.length} locations
        </span>
      </PanelHeader>
      <div ref={containerRef} className="flex-1 relative">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className="absolute inset-0 cursor-pointer"
        />
      </div>
    </div>
  )
}

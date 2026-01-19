"use client"

import type React from "react"
import { useCallback, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"

interface ResizablePanelGroupProps {
  direction: "horizontal" | "vertical"
  children: React.ReactNode
  className?: string
  onResize?: (sizes: number[]) => void
}

interface ResizablePanelProps {
  children: React.ReactNode
  defaultSize?: number
  minSize?: number
  className?: string
}

interface ResizableHandleProps {
  direction: "horizontal" | "vertical"
  onDrag: (delta: number) => void
}

interface ResizablePanelsProps {
  topLeft: React.ReactNode
  topRight: React.ReactNode
  bottomLeft: React.ReactNode
  bottomRight: React.ReactNode
}

export function ResizableHandle({ direction, onDrag }: ResizableHandleProps) {
  const handleRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    
    const startPos = direction === "horizontal" ? e.clientX : e.clientY
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = direction === "horizontal" ? moveEvent.clientX : moveEvent.clientY
      const delta = currentPos - startPos
      onDrag(delta)
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
    
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }, [direction, onDrag])
  
  return (
    <div
      ref={handleRef}
      onMouseDown={handleMouseDown}
      className={cn(
        "flex-shrink-0 bg-border hover:bg-primary/50 transition-colors",
        direction === "horizontal"
          ? "w-1 cursor-col-resize hover:w-1.5"
          : "h-1 cursor-row-resize hover:h-1.5",
        isDragging && "bg-primary"
      )}
    />
  )
}

export function ResizablePanel({ children, className }: ResizablePanelProps) {
  return (
    <div className={cn("overflow-hidden", className)}>
      {children}
    </div>
  )
}

export function ResizablePanelGroup({ 
  direction, 
  children, 
  className,
}: ResizablePanelGroupProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full",
        direction === "horizontal" ? "flex-row" : "flex-col",
        className
      )}
    >
      {children}
    </div>
  )
}

export function ResizablePanels({
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
}: ResizablePanelsProps) {
  const {
    horizontalSplit,
    verticalSplitTop,
    verticalSplitBottom,
    setHorizontalSplit,
    setVerticalSplitTop,
    setVerticalSplitBottom,
  } = useStore()

  const containerRef = useRef<HTMLDivElement>(null)

  const handleHorizontalDrag = useCallback(
    (delta: number) => {
      if (!containerRef.current) return
      const containerHeight = containerRef.current.clientHeight
      const deltaPercent = (delta / containerHeight) * 100
      const newSplit = Math.min(Math.max(horizontalSplit + deltaPercent, 20), 80)
      setHorizontalSplit(newSplit)
    },
    [horizontalSplit, setHorizontalSplit]
  )

  const handleVerticalTopDrag = useCallback(
    (delta: number) => {
      if (!containerRef.current) return
      const containerWidth = containerRef.current.clientWidth
      const deltaPercent = (delta / containerWidth) * 100
      const newSplit = Math.min(Math.max(verticalSplitTop + deltaPercent, 20), 80)
      setVerticalSplitTop(newSplit)
    },
    [verticalSplitTop, setVerticalSplitTop]
  )

  const handleVerticalBottomDrag = useCallback(
    (delta: number) => {
      if (!containerRef.current) return
      const containerWidth = containerRef.current.clientWidth
      const deltaPercent = (delta / containerWidth) * 100
      const newSplit = Math.min(Math.max(verticalSplitBottom + deltaPercent, 20), 80)
      setVerticalSplitBottom(newSplit)
    },
    [verticalSplitBottom, setVerticalSplitBottom]
  )

  return (
    <div ref={containerRef} className="flex h-full w-full flex-col">
      {/* Top Row */}
      <div className="flex" style={{ height: `${horizontalSplit}%` }}>
        <div style={{ width: `${verticalSplitTop}%` }} className="overflow-hidden">
          {topLeft}
        </div>
        <ResizableHandle direction="horizontal" onDrag={handleVerticalTopDrag} />
        <div style={{ width: `${100 - verticalSplitTop}%` }} className="overflow-hidden">
          {topRight}
        </div>
      </div>

      {/* Horizontal Divider */}
      <ResizableHandle direction="vertical" onDrag={handleHorizontalDrag} />

      {/* Bottom Row */}
      <div className="flex flex-1">
        <div style={{ width: `${verticalSplitBottom}%` }} className="overflow-hidden">
          {bottomLeft}
        </div>
        <ResizableHandle direction="horizontal" onDrag={handleVerticalBottomDrag} />
        <div style={{ width: `${100 - verticalSplitBottom}%` }} className="overflow-hidden">
          {bottomRight}
        </div>
      </div>
    </div>
  )
}

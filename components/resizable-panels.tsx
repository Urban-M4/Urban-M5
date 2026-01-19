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

  const handleVerticalDrag = useCallback(
    (delta: number) => {
      if (!containerRef.current) return
      const containerWidth = containerRef.current.clientWidth
      const deltaPercent = (delta / containerWidth) * 100
      const newSplit = Math.min(Math.max(horizontalSplit + deltaPercent, 20), 80)
      setHorizontalSplit(newSplit)
    },
    [horizontalSplit, setHorizontalSplit]
  )

  const handleHorizontalLeftDrag = useCallback(
    (delta: number) => {
      if (!containerRef.current) return
      const containerHeight = containerRef.current.clientHeight
      const deltaPercent = (delta / containerHeight) * 100
      const newSplit = Math.min(Math.max(verticalSplitTop + deltaPercent, 20), 80)
      setVerticalSplitTop(newSplit)
    },
    [verticalSplitTop, setVerticalSplitTop]
  )

  const handleHorizontalRightDrag = useCallback(
    (delta: number) => {
      if (!containerRef.current) return
      const containerHeight = containerRef.current.clientHeight
      const deltaPercent = (delta / containerHeight) * 100
      const newSplit = Math.min(Math.max(verticalSplitBottom + deltaPercent, 20), 80)
      setVerticalSplitBottom(newSplit)
    },
    [verticalSplitBottom, setVerticalSplitBottom]
  )

  return (
    <div ref={containerRef} className="flex h-full w-full flex-row">
      {/* Left Column */}
      <div className="flex flex-col" style={{ width: `${horizontalSplit}%` }}>
        <div style={{ height: `${verticalSplitTop}%` }} className="overflow-hidden">
          {topLeft}
        </div>
        <ResizableHandle direction="vertical" onDrag={handleHorizontalLeftDrag} />
        <div style={{ height: `${100 - verticalSplitTop}%` }} className="overflow-hidden">
          {bottomLeft}
        </div>
      </div>

      {/* Vertical Divider */}
      <ResizableHandle direction="horizontal" onDrag={handleVerticalDrag} />

      {/* Right Column */}
      <div className="flex flex-col flex-1">
        <div style={{ height: `${verticalSplitBottom}%` }} className="overflow-hidden">
          {topRight}
        </div>
        <ResizableHandle direction="vertical" onDrag={handleHorizontalRightDrag} />
        <div style={{ height: `${100 - verticalSplitBottom}%` }} className="overflow-hidden">
          {bottomRight}
        </div>
      </div>
    </div>
  )
}

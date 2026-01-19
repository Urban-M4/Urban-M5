"use client"

import React from "react"

import { cn } from "@/lib/utils"

interface PanelHeaderProps {
  title: string
  children?: React.ReactNode
  className?: string
}

export function PanelHeader({ title, children, className }: PanelHeaderProps) {
  return (
    <div className={cn(
      "flex items-center justify-between px-3 py-2 border-b border-border bg-card/50",
      className
    )}>
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  )
}

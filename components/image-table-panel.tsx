"use client"

import { useStore } from "@/lib/store"
import { SCORE_HEX } from "@/lib/types"
import { PanelHeader } from "./panel-header"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function ImageTablePanel() {
  const {
    images,
    selectedImageId,
    selectImage,
    scoreFilter,
    setScoreFilter,
    updateImageScore,
  } = useStore()
  
  const filteredImages = images.filter(
    img => img.qualityScore >= scoreFilter.min && img.qualityScore <= scoreFilter.max
  )
  
  const getFilterValue = () => {
    if (scoreFilter.min === 1 && scoreFilter.max === 5) return "all"
    if (scoreFilter.max === 5) return scoreFilter.min.toString()
    return "all"
  }
  
  const handleFilterChange = (value: string) => {
    if (value === "all") {
      setScoreFilter({ min: 1, max: 5 })
    } else {
      setScoreFilter({ min: Number(value), max: 5 })
    }
  }
  
  return (
    <div className="flex flex-col h-full bg-card">
      <PanelHeader title="Images">
        <Select
          value={getFilterValue()}
          onValueChange={handleFilterChange}
        >
          <SelectTrigger className="w-28 h-7 text-xs">
            <SelectValue placeholder="Filter score" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All scores</SelectItem>
            <SelectItem value="1">1+ stars</SelectItem>
            <SelectItem value="2">2+ stars</SelectItem>
            <SelectItem value="3">3+ stars</SelectItem>
            <SelectItem value="4">4+ stars</SelectItem>
            <SelectItem value="5">5 stars</SelectItem>
          </SelectContent>
        </Select>
      </PanelHeader>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card border-b border-border">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Score</th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Segments</th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredImages.map((image) => (
              <tr
                key={image.id}
                onClick={() => selectImage(image.id)}
                className={cn(
                  "cursor-pointer border-b border-border/50 hover:bg-secondary/50 transition-colors",
                  selectedImageId === image.id && "bg-secondary"
                )}
              >
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded bg-cover bg-center flex-shrink-0"
                      style={{ backgroundImage: `url(${image.url})` }}
                    />
                    <span className="truncate max-w-32">{image.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        type="button"
                        key={score}
                        onClick={(e) => {
                          e.stopPropagation()
                          updateImageScore(image.id, score)
                        }}
                        className="p-0.5 hover:scale-125 transition-transform"
                        title={`Set score to ${score}`}
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill={score <= image.qualityScore ? SCORE_HEX[image.qualityScore] : "none"}
                          stroke={score <= image.qualityScore ? SCORE_HEX[image.qualityScore] : "#64748b"}
                          strokeWidth="1.5"
                        >
                          <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.69l5.34-.78L10 1z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className="text-muted-foreground">{image.segments.length}</span>
                </td>
                <td className="px-3 py-2">
                  <span className="text-muted-foreground text-xs">
                    {new Date(image.capturedAt).toLocaleDateString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

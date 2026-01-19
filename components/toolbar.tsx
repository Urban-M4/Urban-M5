"use client";

import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChevronLeft,
  ChevronRight,
  Keyboard,
  Filter,
  Star,
} from "lucide-react";
import { ShortcutsHelp } from "./keyboard-shortcuts";
import { Slider } from "@/components/ui/slider";

export function Toolbar() {
  const {
    images,
    selectedImageId,
    navigateToNextImage,
    navigateToPreviousImage,
    updateImageScore,
    scoreFilter,
    setScoreFilter,
  } = useStore();

  const selectedImage = images.find((img) => img.id === selectedImageId);
  const currentIndex = images.findIndex((img) => img.id === selectedImageId);
  const filteredImages = images.filter(
    (img) => img.qualityScore >= scoreFilter.min && img.qualityScore <= scoreFilter.max
  );

  return (
    <div className="flex h-12 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">GeoSegment</h1>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {filteredImages.length} of {images.length} images
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Score Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Score: {scoreFilter.min}-{scoreFilter.max}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Filter by Score</span>
                <span className="text-xs text-muted-foreground">
                  {scoreFilter.min} - {scoreFilter.max}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 text-xs">Min:</span>
                  <Slider
                    value={[scoreFilter.min]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={([val]) =>
                      setScoreFilter({ ...scoreFilter, min: val })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 text-xs">Max:</span>
                  <Slider
                    value={[scoreFilter.max]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={([val]) =>
                      setScoreFilter({ ...scoreFilter, max: val })
                    }
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Image Score */}
        {selectedImage && (
          <div className="flex items-center gap-1 rounded-md border border-border px-2 py-1">
            <span className="mr-1 text-xs text-muted-foreground">Score:</span>
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => updateImageScore(selectedImage.id, score)}
                className="p-0.5 transition-colors hover:text-primary"
                title={`Set score to ${score}`}
              >
                <Star
                  className={`h-4 w-4 ${
                    score <= selectedImage.qualityScore
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            onClick={navigateToPreviousImage}
            disabled={currentIndex <= 0}
            title="Previous image (← or P)"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[60px] text-center text-sm text-muted-foreground">
            {currentIndex + 1} / {filteredImages.length}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            onClick={navigateToNextImage}
            disabled={currentIndex >= filteredImages.length - 1}
            title="Next image (→ or N)"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Keyboard Shortcuts */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
              <Keyboard className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-2">
              <h4 className="font-medium">Keyboard Shortcuts</h4>
              <ShortcutsHelp />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

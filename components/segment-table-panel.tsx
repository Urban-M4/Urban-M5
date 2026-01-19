"use client";

import { useStore } from "@/lib/store";
import { SegmentClass, SEGMENT_CLASSES, CLASS_COLORS } from "@/lib/types";
import { PanelHeader } from "./panel-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Trash2 } from "lucide-react";

export function SegmentTablePanel() {
  const {
    images,
    selectedImageId,
    selectedSegmentId,
    selectSegment,
    updateSegmentClass,
    updateSegmentScore,
    deleteSegment,
  } = useStore();

  const selectedImage = images.find((img) => img.id === selectedImageId);
  const segments = selectedImage?.segments || [];

  const getClassColor = (segmentClass: SegmentClass) => {
    return CLASS_COLORS[segmentClass];
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <PanelHeader title="Segments" badge={segments.length.toString()} />

      <div className="flex-1 overflow-auto">
        {segments.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p className="text-sm">No segments found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Class</th>
                <th className="px-3 py-2 font-medium">Score</th>
                <th className="px-3 py-2 font-medium">Points</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((segment) => (
                <tr
                  key={segment.id}
                  className={`cursor-pointer border-b border-border/50 text-sm transition-colors hover:bg-secondary/50 ${
                    selectedSegmentId === segment.id ? "bg-secondary" : ""
                  }`}
                  onClick={() => selectSegment(segment.id)}
                >
                  <td className="px-3 py-2 font-mono text-xs">
                    {segment.id.slice(0, 6)}
                  </td>
                  <td className="px-3 py-2">
                    <Select
                      value={segment.class}
                      onValueChange={(value: SegmentClass) =>
                        updateSegmentClass(segment.id, value)
                      }
                    >
                      <SelectTrigger
                        className="h-7 w-24 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SelectValue>
                          <Badge
                            variant="outline"
                            className="border-0 text-xs"
                            style={{
                              backgroundColor: `${getClassColor(segment.class)}30`,
                              color: getClassColor(segment.class),
                            }}
                          >
                            {segment.class}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {SEGMENT_CLASSES.map((cls) => (
                          <SelectItem key={cls} value={cls}>
                            <Badge
                              variant="outline"
                              className="border-0 text-xs"
                              style={{
                                backgroundColor: `${getClassColor(cls)}30`,
                                color: getClassColor(cls),
                              }}
                            >
                              {cls}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2">
                    <div
                      className="flex items-center gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          onClick={() => updateSegmentScore(segment.id, score)}
                          className="p-0.5 transition-colors hover:text-primary"
                        >
                          <Star
                            className={`h-3 w-3 ${
                              score <= segment.qualityScore
                                ? "fill-primary text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {segment.polygon.length}
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSegment(segment.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

"use client";

import { ResizablePanels } from "@/components/resizable-panels";
import { MapPanel } from "@/components/map-panel";
import { ImageTablePanel } from "@/components/image-table-panel";
import { ImageViewerPanel } from "@/components/image-viewer-panel";
import { SegmentTablePanel } from "@/components/segment-table-panel";
import { Toolbar } from "@/components/toolbar";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";

export default function Home() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <KeyboardShortcuts />
      <Toolbar />
      <div className="flex-1 overflow-hidden">
        <ResizablePanels
          topLeft={<MapPanel />}
          topRight={<ImageViewerPanel />}
          bottomLeft={<ImageTablePanel />}
          bottomRight={<SegmentTablePanel />}
        />
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function KeyboardShortcuts() {
  const {
    images,
    selectedImageId,
    navigateToNextImage,
    navigateToPreviousImage,
    updateImageScore,
    setDrawingMode,
    drawingMode,
    setOverlayMode,
    overlayMode,
  } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const selectedImage = images.find((img) => img.id === selectedImageId);

      switch (e.key) {
        // Navigation
        case "ArrowRight":
        case "n":
          e.preventDefault();
          navigateToNextImage();
          break;
        case "ArrowLeft":
        case "p":
          e.preventDefault();
          navigateToPreviousImage();
          break;

        // Image quality scores (1-5)
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
          if (selectedImageId) {
            e.preventDefault();
            updateImageScore(selectedImageId, parseInt(e.key));
          }
          break;

        // Drawing mode toggle
        case "d":
          e.preventDefault();
          setDrawingMode(drawingMode === "draw" ? null : "draw");
          break;

        // Subtract mode toggle
        case "s":
          e.preventDefault();
          setDrawingMode(drawingMode === "subtract" ? null : "subtract");
          break;

        // Overlay modes
        case "f":
          e.preventDefault();
          setOverlayMode("filled");
          break;
        case "b":
          e.preventDefault();
          setOverlayMode("border");
          break;
        case "h":
          e.preventDefault();
          setOverlayMode("hidden");
          break;
        case "m":
          e.preventDefault();
          setOverlayMode("mask");
          break;

        // Escape to cancel drawing
        case "Escape":
          e.preventDefault();
          setDrawingMode(null);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    images,
    selectedImageId,
    navigateToNextImage,
    navigateToPreviousImage,
    updateImageScore,
    setDrawingMode,
    drawingMode,
    setOverlayMode,
    overlayMode,
  ]);

  return null;
}

export function ShortcutsHelp() {
  const shortcuts = [
    { key: "←/P", action: "Previous image" },
    { key: "→/N", action: "Next image" },
    { key: "1-5", action: "Set image score" },
    { key: "D", action: "Draw mode" },
    { key: "S", action: "Subtract mode" },
    { key: "F", action: "Filled overlay" },
    { key: "B", action: "Border overlay" },
    { key: "H", action: "Hide segments" },
    { key: "M", action: "Mask mode" },
    { key: "Esc", action: "Cancel drawing" },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
      {shortcuts.map((shortcut) => (
        <div key={shortcut.key} className="flex items-center gap-2">
          <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">
            {shortcut.key}
          </kbd>
          <span className="text-muted-foreground">{shortcut.action}</span>
        </div>
      ))}
    </div>
  );
}

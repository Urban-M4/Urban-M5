import { Keyboard } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import {
  useImageNavigation,
  useImageActions,
  useCurrentImageId,
} from "@/hooks/streetscapes";
import { useEffect } from "react";

export function KeyboardShortcuts() {
  const { goToNext, goToPrevious } = useImageNavigation();
  const { setRating } = useImageActions();
  const [currentImageId] = useCurrentImageId();

  // Keyboard shortcuts for image navigation & rating
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable ||
        target.getAttribute("role") === "combobox" ||
        target.getAttribute("role") === "textbox";

      if (isInputField) return;

      if (event.key === "ArrowRight" || event.key.toLowerCase() === "n") {
        event.preventDefault();
        goToNext();
      } else if (event.key === "ArrowLeft" || event.key.toLowerCase() === "p") {
        event.preventDefault();
        goToPrevious();
      } else if (/^[0-5]$/.test(event.key)) {
        // set rating with keys 0..5
        if (!currentImageId) return;
        event.preventDefault();
        const rating = Number(event.key);
        setRating({
          params: {
            path: { image_id: currentImageId },
            query: { rating },
          },
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious, setRating, currentImageId]);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Keyboard shortcuts"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
        }
      ></PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Keyboard Shortcuts</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Toggle Sidebar</span>
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded">
                {navigator.platform.toUpperCase().indexOf("MAC") >= 0
                  ? "⌘"
                  : "Ctrl"}
                +B
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Previous Image</span>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded">
                  ←
                </kbd>
                <span className="text-xs text-muted-foreground">or</span>
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded">
                  P
                </kbd>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Next Image</span>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded">
                  →
                </kbd>
                <span className="text-xs text-muted-foreground">or</span>
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded">
                  N
                </kbd>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Set Rating</span>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded">
                  0
                </kbd>
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded">
                  1
                </kbd>
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded">
                  2
                </kbd>
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded">
                  3
                </kbd>
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded">
                  4
                </kbd>
                <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded">
                  5
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

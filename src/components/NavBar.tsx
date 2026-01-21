import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useImageNavigation } from "@/hooks/streetscapes";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ModeToggle } from "./mode-toggle";

function ImageNavigationButtons() {
  const { total, filtered, currentIndex, goToPrevious, goToNext } =
    useImageNavigation();
  return (
    <nav
      className="flex-1 flex items-center justify-center gap-1"
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
    >
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 bg-transparent"
        title="Previous image (← or P)"
        aria-label="Go to previous image"
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-15 text-center text-sm text-muted-foreground">
        {currentIndex + 1} / {filtered} (total: {total})
      </span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 bg-transparent"
        title="Next image (→ or N)"
        aria-label="Go to next image"
        onClick={goToNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

export function NavBar() {
  return (
    <nav className="w-full h-12 flex items-center px-4 gap-4 border-b">
      {/* Left: Trigger and Title */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold">Urban M5</h1>
      </div>

      {/* Middle: Navigation Buttons */}
      <ImageNavigationButtons />

      {/* Right: Info Popover */}
      <div>
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Information"
              >
                <Info className="h-4 w-4" />
              </Button>
            }
          ></PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Resources</h3>
              <div className="flex flex-col gap-2">
                <a
                  href="https://github.com/Urban-M4/Urban-M5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  GitHub Repository
                </a>
                <a
                  href="https://streetscapes.readthedocs.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Streetscapes Documentation
                </a>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <ModeToggle />
      </div>
    </nav>
  );
}

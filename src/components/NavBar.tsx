import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";

export function NavBar() {
  return (
    <nav className="w-full h-12 flex items-center px-4 gap-4 border-b">
      <SidebarTrigger />

      <h1 className="text-lg font-semibold">Urban M5</h1>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-transparent"
          title="Previous image (← or P)"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-15 text-center text-sm text-muted-foreground">
          ? / ?
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-transparent"
          title="Next image (→ or N)"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}

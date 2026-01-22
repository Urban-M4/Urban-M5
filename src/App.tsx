import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FilterPanel } from "./components/FilterPanel";
import { ImagePanel } from "./components/ImagePanel";
import { MapPanel } from "./components/MapPanel";
import { NavBar } from "./components/NavBar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";
import { SidebarProvider } from "./components/ui/sidebar";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <FilterPanel />
        <main className="flex flex-col h-screen w-full overflow-hidden">
          <NavBar />
          <ResizablePanelGroup
            direction="horizontal"
            className="flex-1 w-full min-h-0 overflow-hidden"
          >
            <ResizablePanel
              defaultSize={50}
              minSize={20}
              className="min-w-0 h-full"
            >
              <div className="h-full w-full overflow-hidden">
                <MapPanel />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle className="mx-2" />
            <ResizablePanel
              defaultSize={50}
              minSize={20}
              className="min-w-0 h-full"
            >
              <div className="h-full w-full overflow-auto">
                <ImagePanel />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </SidebarProvider>
    </QueryClientProvider>
  );
}

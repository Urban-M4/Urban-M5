import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "./ui/sidebar";
import { FilterPanel } from "./FilterPanel";
import { MapPanel } from "./MapPanel";
import { ImagePanel } from "./ImagePanel";
import { NavBar } from "./NavBar";

const queryClient = new QueryClient();

export function UrbanM5App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <FilterPanel />
        <main className="flex flex-col h-screen w-full overflow-hidden">
          <NavBar />
          <div className="flex flex-row flex-1 w-full gap-4 overflow-hidden">
            <MapPanel />
            <ImagePanel />
          </div>
        </main>
      </SidebarProvider>
    </QueryClientProvider>
  );
}

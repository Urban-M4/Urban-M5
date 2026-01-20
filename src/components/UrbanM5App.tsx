import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
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
        <main>
          <NavBar />
          <div className="flex flex-row h-full w-full gap-4">
            <MapPanel />
            <ImagePanel />
          </div>
        </main>
      </SidebarProvider>
    </QueryClientProvider>
  );
}

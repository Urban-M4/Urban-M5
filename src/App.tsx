import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FilterPanel } from "./components/FilterPanel";
import { ImagePanel } from "./components/ImagePanel";
import { MapPanel } from "./components/MapPanel";
import { NavBar } from "./components/NavBar";
import { SidebarProvider } from "./components/ui/sidebar";

const queryClient = new QueryClient();

export function App() {
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

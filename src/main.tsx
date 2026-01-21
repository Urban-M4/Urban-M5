import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NuqsAdapter } from "nuqs/adapters/react";
import "./index.css";
import Wrapper from "./Wrapper.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NuqsAdapter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Wrapper />
      </ThemeProvider>
    </NuqsAdapter>
  </StrictMode>,
);

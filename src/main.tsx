import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App";
import { ThemeProvider } from "./theme";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
    <ConvexAuthProvider client={convex}>
      <App />
    </ConvexAuthProvider>
    ,
  </ThemeProvider>,
);

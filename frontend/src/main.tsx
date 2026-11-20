import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { UserProvider } from "./context/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const root = createRoot(document.getElementById("root")!, {
  // React does not throw a render error anymore, it reports it. Without
  // these handlers the error would be swallowed.
  onUncaughtError: (error, errorInfo) => {
    console.error("Uncaught error:", error, errorInfo.componentStack);
  },
  onCaughtError: (error, errorInfo) => {
    console.error("Caught error:", error, errorInfo.componentStack);
  },
});

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <App />
      </UserProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

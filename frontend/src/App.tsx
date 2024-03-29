import React, { useState } from "react";
import { ReactQueryDevtools } from "react-query/devtools";
import { QueryClient, QueryClientProvider } from "react-query";
import PanelParent from "./components/navigation/PanelParent";
import AddMangaButton from "./components/navigation/AddMangaButton";
import Navigation from "./components/navigation/Navigation";
import { UIProvider } from "./components/navigation/UIContext";
import { useAuth } from "./AuthContext";
import AuthorizationModal from "./components/AuthorizationModal";
import { ThemeProvider } from "@emotion/react";
import { createTheme, CssBaseline, Box } from "@mui/material";

const queryClient = new QueryClient();
const mdTheme = createTheme({
  palette: {
    mode: "light",
  },
});

export default function Dashboard() {
  const { isAuthorized, isLoggedIn } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(!isAuthorized);

  const handleCloseModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <UIProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={mdTheme}>
          <CssBaseline />
          <Box sx={{ display: "flex" }}>
            <Navigation />
            <PanelParent />
          </Box>
          {isLoggedIn && <AddMangaButton />}
        </ThemeProvider>
        {isLoggedIn && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
      <AuthorizationModal isOpen={isAuthModalOpen} onClose={handleCloseModal} />
    </UIProvider>
  );
}

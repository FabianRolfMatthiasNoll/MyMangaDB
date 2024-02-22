import React, { useState } from 'react';
import { ReactQueryDevtools } from "react-query/devtools";
import { QueryClient, QueryClientProvider } from "react-query";
import PanelParent from "./components/navigation/PanelParent";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import AddMangaButton from "./components/navigation/AddMangaButton";
import Navigation from "./components/navigation/Navigation";
import { UIProvider } from "./components/navigation/UIContext";
import { useAuth } from './AuthContext';
import AuthorizationModal from './components/AuthorizationModal'; 

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
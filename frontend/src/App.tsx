import { ReactQueryDevtools } from "react-query/devtools";
import { QueryClient, QueryClientProvider } from "react-query";
import PanelParent from "./components/navigation/PanelParent";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import AddMangaButton from "./components/navigation/AddMangaButton";
import Navigation from "./components/navigation/Navigation";
import { UIProvider } from "./components/navigation/UIContext";

const queryClient = new QueryClient();
const mdTheme = createTheme({
  palette: {
    mode: "light",
  },
});

export default function Dashboard() {
  return (
    <UIProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={mdTheme}>
          <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <Navigation />
            <PanelParent />
          </Box>
          <AddMangaButton />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </UIProvider>
  );
}

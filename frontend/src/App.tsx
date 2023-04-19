import { ReactQueryDevtools } from "react-query/devtools";
import { QueryClient, QueryClientProvider } from "react-query";
import DashboardContent from "./components/dashboard/DashboardContent";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import AddMangaButton from "./components/navigation/AddMangaButton";
import Navigation from "./components/navigation/Navigation";

const queryClient = new QueryClient();

const mdTheme = createTheme();

export default function Dashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={mdTheme}>
        <Box sx={{ display: "flex" }}>
          <CssBaseline />
          <Navigation />
          <DashboardContent />
        </Box>
        <AddMangaButton />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

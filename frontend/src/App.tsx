import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
} from "@mui/material";
import Header from "./components/Header";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NotFound from "./pages/NotFound";
import { useMemo, useState } from "react";
import { deDE } from "@mui/material/locale";
import Dashboard from "./pages/Dashboard";
import MangaDetails from "./pages/MangaDetails";
import ListOverview from "./components/ListOverview";
import MangaListByListId from "./components/MangaListByList";

function App() {
  const [mode, setMode] = useState<"light" | "dark">("dark");

  const toggleThemeMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const theme = useMemo(
    () =>
      responsiveFontSizes(
        createTheme(
          {
            palette: {
              mode,
            },
          },
          deDE
        )
      ),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Header toggleThemeMode={toggleThemeMode} />
        <Box style={{ display: "flex" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/manga/:id" element={<MangaDetails />} />
            <Route path="/lists" element={<ListOverview />} />
            <Route path="/list/:listId" element={<MangaListByListId />} />
            <Route path="/authors" element={<NotFound />} />
            <Route path="/genres" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

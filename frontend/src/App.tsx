import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
} from "@mui/material";
import Header from "./components/Header";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";
import NotFound from "./pages/NotFound";
import { useMemo, useState } from "react";
import { deDE } from "@mui/material/locale";
import Dashboard from "./pages/Dashboard";
import MangaDetails from "./pages/MangaDetails";
import ListsPage from "./pages/ListsPage";
import ListDetailPage from "./pages/ListDetailPage";
import SettingsPage from "./pages/SettingsPage";
import CreateManga from "./pages/CreateManga";
import AuthorsPage from "./pages/AuthorsPage";
import AuthorDetailPage from "./pages/AuthorDetailPage";
import GenresPage from "./pages/GenresPage";
import GenreDetailPage from "./pages/GenreDetailPage";
import LoginPage from "./pages/LoginPage";
import { isAuthenticated } from "./services/auth";

const PrivateRoutes = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
};

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
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<PrivateRoutes />}>
            <Route
              path="*"
              element={
                <>
                  <Header toggleThemeMode={toggleThemeMode} />
                  <Box style={{ display: "flex" }}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/manga/:id" element={<MangaDetails />} />
                      <Route path="/create-manga" element={<CreateManga />} />
                      <Route path="/lists" element={<ListsPage />} />
                      <Route
                        path="/lists/:listId"
                        element={<ListDetailPage />}
                      />
                      <Route path="/authors" element={<AuthorsPage />} />
                      <Route
                        path="/authors/:authorId"
                        element={<AuthorDetailPage />}
                      />
                      <Route path="/genres" element={<GenresPage />} />
                      <Route
                        path="/genres/:genreId"
                        element={<GenreDetailPage />}
                      />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Box>
                </>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

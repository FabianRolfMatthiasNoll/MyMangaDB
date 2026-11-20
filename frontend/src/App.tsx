import {
  Box,
  CircularProgress,
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
import { useEffect, useMemo, useState } from "react";
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
import StatisticsPage from "./pages/StatisticsPage";
import WishlistPage from "./pages/WishlistPage";
import NotificationHost from "./components/NotificationHost";
import { isAuthenticated } from "./services/auth";
import { useUser } from "./context/UserContext";

const THEME_STORAGE_KEY = "themeMode";

const PrivateRoutes = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
};

const AdminRoutes = () => {
  const { isAdmin, loading } = useUser();

  // While the user is being checked the page would be empty. A spinner
  // shows that something is happening.
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" />;
};

function App() {
  // The theme is remembered, like the language. A reload should not
  // throw the choice away.
  const [mode, setMode] = useState<"light" | "dark">(() =>
    localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark",
  );

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  const toggleThemeMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const theme = useMemo(
    () =>
      responsiveFontSizes(
        createTheme(
          {
            cssVariables: true,
            palette: {
              mode,
            },
          },
          deDE,
        ),
      ),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationHost />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<PrivateRoutes />}>
            <Route
              path="*"
              element={
                <>
                  <Header toggleThemeMode={toggleThemeMode} />
                  <Box sx={{ display: "flex" }}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/manga/:id" element={<MangaDetails />} />
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
                      <Route path="/statistics" element={<StatisticsPage />} />
                      <Route element={<AdminRoutes />}>
                        <Route path="/create-manga" element={<CreateManga />} />
                        <Route path="/settings" element={<SettingsPage />} />
                      </Route>
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

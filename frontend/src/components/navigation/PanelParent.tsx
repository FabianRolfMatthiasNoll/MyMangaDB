import MangaList from "../dashboard/MangaList";
import SettingsMenu from "../settings_menu/SettingsMenu";
import { useUI } from "./UIContext";
import AuthorMenu from "../author_panel/AuthorMenu";
import GenreMenu from "../genre_panel/GenreMenu";
import StatisticMenu from "../statistic_panel/StatisticMenu";
import { Typography, Link, Box, Toolbar, Container, Grid } from "@mui/material";

function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        MyMangaDB
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

export default function PanelParent() {
  const { activeComponent, setActiveComponent } = useUI();
  return (
    <Box
      component="main"
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
        flexGrow: 1,
        height: "100vh",
        overflow: "auto",
        pr: 5,
      }}
    >
      <Toolbar />
      <Container maxWidth={false} sx={{ mt: 7, mb: 4, ml: 4 }}>
        <Grid container spacing={3}>
          {activeComponent === "dashboard" && <MangaList />}
          {activeComponent === "settings" && <SettingsMenu />}
          {activeComponent === "genre" && <GenreMenu />}
          {activeComponent === "author" && <AuthorMenu />}
          {activeComponent === "statistics" && <StatisticMenu />}
        </Grid>
        <Copyright sx={{ pt: 4, mt: 20 }} />
      </Container>
    </Box>
  );
}

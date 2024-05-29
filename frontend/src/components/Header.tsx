import React from "react";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeIcon from "@mui/icons-material/LightMode";
import {
  AppBar,
  Box,
  IconButton,
  MenuItem,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";

interface NavBarProps {
  toggleThemeMode: () => void;
}

const Header: React.FC<NavBarProps> = ({ toggleThemeMode }) => {
  const theme = useTheme();
  return (
    <AppBar position="static">
      <Toolbar>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            zIndex: 10000,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".1rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              MyMangaDB
            </Typography>
            <MenuItem>
              <Typography textAlign="center">Dashboard</Typography>
            </MenuItem>
            <MenuItem>
              <Typography textAlign="center">Authors</Typography>
            </MenuItem>
            <MenuItem>
              <Typography textAlign="center">Genres</Typography>
            </MenuItem>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <MenuItem>
              <Typography textAlign="center">Settings</Typography>
            </MenuItem>
            <IconButton onClick={toggleThemeMode} sx={{ alignSelf: "center" }}>
              {theme.palette.mode === "dark" ? (
                <LightModeIcon />
              ) : (
                <DarkModeRoundedIcon />
              )}
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  AppBar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import { logout } from "../services/auth";

interface NavBarProps {
  toggleThemeMode: () => void;
}

const Header: React.FC<NavBarProps> = ({ toggleThemeMode }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const menuItems = [
    { text: "Dashboard", path: "/" },
    { text: "Lists", path: "/lists" },
    { text: "Authors", path: "/authors" },
    { text: "Genres", path: "/genres" },
    { text: "Settings", path: "/settings" },
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
  };

  const mobileMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "left" }}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      sx={{ marginTop: 5 }}
    >
      {menuItems.map((item) => (
        <MenuItem
          key={item.text}
          component={Link}
          to={item.path}
          selected={location.pathname === item.path}
          onClick={handleMenuClose}
        >
          {item.text}
        </MenuItem>
      ))}
      <MenuItem onClick={handleLogout}>
        Logout
      </MenuItem>
    </Menu>
  );

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
            {isMobile ? (
              <>
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMenuOpen}
                >
                  <MenuIcon />
                </IconButton>
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
              </>
            ) : (
              <>
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
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.text}
                    component={Link}
                    to={item.path}
                    selected={location.pathname === item.path}
                    sx={{
                      borderRadius: 2,
                      "&.Mui-selected": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? theme.palette.primary.dark
                            : theme.palette.primary.light,
                        color: theme.palette.primary.contrastText,
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? theme.palette.primary.dark
                            : theme.palette.primary.light,
                      },
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? theme.palette.primary.main
                            : theme.palette.primary.light,
                        color: theme.palette.primary.contrastText,
                      },
                    }}
                  >
                    <Typography textAlign="center">{item.text}</Typography>
                  </MenuItem>
                ))}
              </>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <IconButton onClick={toggleThemeMode} sx={{ alignSelf: "center" }}>
              {theme.palette.mode === "dark" ? (
                <LightModeIcon />
              ) : (
                <DarkModeRoundedIcon />
              )}
            </IconButton>
            {!isMobile && (
              <Tooltip title="Logout">
                <IconButton onClick={handleLogout} sx={{ alignSelf: "center" }}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Toolbar>
      {isMobile && mobileMenu}
    </AppBar>
  );
};

export default Header;

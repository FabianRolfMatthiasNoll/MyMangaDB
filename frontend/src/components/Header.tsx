import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import LanguageIcon from "@mui/icons-material/Language";
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
import { useUser } from "../context/UserContext";
import { useTranslation } from "react-i18next";

interface NavBarProps {
  toggleThemeMode: () => void;
}

const Header: React.FC<NavBarProps> = ({ toggleThemeMode }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);
  const { isAdmin } = useUser();
  const { t, i18n } = useTranslation();

  const menuItems = [
    { text: t("nav.dashboard"), path: "/" },
    { text: t("nav.lists"), path: "/lists" },
    { text: t("nav.authors"), path: "/authors" },
    { text: t("nav.genres"), path: "/genres" },
    { text: t("nav.statistics"), path: "/statistics" },
    ...(isAdmin ? [{ text: t("nav.settings"), path: "/settings" }] : []),
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleLangMenuClose = () => {
    setLangAnchorEl(null);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    handleLangMenuClose();
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
      <MenuItem onClick={handleLogout}>{t("nav.logout")}</MenuItem>
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
            <Tooltip title={t("language.select")}>
              <IconButton
                onClick={handleLangMenuOpen}
                sx={{ alignSelf: "center", color: "inherit" }}
              >
                <LanguageIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={langAnchorEl}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              open={Boolean(langAnchorEl)}
              onClose={handleLangMenuClose}
              sx={{ marginTop: 5 }}
            >
              <MenuItem
                onClick={() => handleLanguageChange("en")}
                selected={i18n.language === "en"}
              >
                {t("language.en")}
              </MenuItem>
              <MenuItem
                onClick={() => handleLanguageChange("de")}
                selected={i18n.language === "de"}
              >
                {t("language.de")}
              </MenuItem>
            </Menu>
            <IconButton onClick={toggleThemeMode} sx={{ alignSelf: "center" }}>
              {theme.palette.mode === "dark" ? (
                <LightModeIcon />
              ) : (
                <DarkModeRoundedIcon />
              )}
            </IconButton>
            {!isMobile && (
              <Tooltip title={t("nav.logout")}>
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

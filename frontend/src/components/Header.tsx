import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import LanguageIcon from "@mui/icons-material/Language";
import {
  AppBar,
  Badge,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { logout } from "../services/auth";
import { getWishlistMangas } from "../services/wishlistService";
import { useUser } from "../context/UserContext";
import { useTranslation } from "react-i18next";

interface NavBarProps {
  toggleThemeMode: () => void;
}

const Header: React.FC<NavBarProps> = ({ toggleThemeMode }) => {
  const theme = useTheme();
  const location = useLocation();
  // The desktop navigation needs about 1000 pixels for its seven entries.
  // Below that the labels are squeezed into the fixed-height app bar, so
  // the drawer takes over earlier than on a phone.
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);
  const { isAdmin } = useUser();
  const { t, i18n } = useTranslation();

  // The wishlist is shared with the wishlist page, so this is served from
  // the cache once it has been loaded there.
  const { data: wishlist = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlistMangas,
  });

  const menuItems = [
    { text: t("nav.dashboard"), path: "/" },
    { text: t("nav.wishlist"), path: "/wishlist", badge: wishlist.length },
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
          <Badge
            color="secondary"
            badgeContent={item.badge}
            invisible={!item.badge}
          >
            {item.text}
          </Badge>
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
                  aria-label={t("nav.menu")}
                  onClick={handleMenuOpen}
                >
                  <MenuIcon />
                </IconButton>
                <Typography
                  variant="h6"
                  component={Link}
                  to="/"
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
                  {t("app.title")}
                </Typography>
              </>
            ) : (
              <>
                <Typography
                  variant="h6"
                  component={Link}
                  to="/"
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
                  {t("app.title")}
                </Typography>
                {menuItems.map((item) => {
                  const isSelected = location.pathname === item.path;
                  return (
                    <Button
                      key={item.text}
                      component={Link}
                      to={item.path}
                      color="inherit"
                      sx={{
                        borderRadius: 2,
                        // A button shouts its label in capital letters, a
                        // menu item does not. The navigation is a list of
                        // words, not a call to action.
                        textTransform: "none",
                        ...(isSelected && {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? theme.palette.primary.dark
                              : theme.palette.primary.light,
                          color: theme.palette.primary.contrastText,
                        }),
                        "&:hover": {
                          backgroundColor:
                            theme.palette.mode === "dark"
                              ? theme.palette.primary.main
                              : theme.palette.primary.light,
                          color: theme.palette.primary.contrastText,
                        },
                      }}
                    >
                      <Badge
                        color="secondary"
                        // Three digits do not fit into the small badge
                        // circle - they would spill over the label.
                        badgeContent={
                          item.badge && item.badge > 99 ? "99+" : item.badge
                        }
                        invisible={!item.badge}
                        // The badge sits on the top right corner of the
                        // label, so it needs room of its own - otherwise it
                        // covers the last letter.
                        sx={{ "& .MuiBadge-badge": { top: -2, right: -4 } }}
                      >
                        <Typography sx={{ textAlign: "center", pr: 1 }}>
                          {item.text}
                        </Typography>
                      </Badge>
                    </Button>
                  );
                })}
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
            <Tooltip
              title={
                theme.palette.mode === "dark"
                  ? t("nav.lightMode")
                  : t("nav.darkMode")
              }
            >
              <IconButton
                onClick={toggleThemeMode}
                aria-label={
                  theme.palette.mode === "dark"
                    ? t("nav.lightMode")
                    : t("nav.darkMode")
                }
                sx={{ alignSelf: "center" }}
              >
                {theme.palette.mode === "dark" ? (
                  <LightModeIcon />
                ) : (
                  <DarkModeRoundedIcon />
                )}
              </IconButton>
            </Tooltip>
            {!isMobile && (
              <Tooltip title={t("nav.logout")}>
                <IconButton
                  onClick={handleLogout}
                  aria-label={t("nav.logout")}
                  sx={{ alignSelf: "center" }}
                >
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

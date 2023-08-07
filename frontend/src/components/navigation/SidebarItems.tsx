import * as React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PeopleIcon from "@mui/icons-material/People";
import BookIcon from "@mui/icons-material/Book";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import { useUI } from "./UIContext";

export default function SidebarItems() {
  const { activeComponent, setActiveComponent } = useUI();
  return (
    <React.Fragment>
      <ListItemButton onClick={() => setActiveComponent("dashboard")}>
        <ListItemIcon>
          <BookIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItemButton>
      <ListItemButton onClick={() => setActiveComponent("author")}>
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Authors" />
      </ListItemButton>
      <ListItemButton onClick={() => setActiveComponent("genre")}>
        <ListItemIcon>
          <AccountTreeIcon />
        </ListItemIcon>
        <ListItemText primary="Genres" />
      </ListItemButton>
      <ListItemButton onClick={() => setActiveComponent("statistics")}>
        <ListItemIcon>
          <EqualizerIcon />
        </ListItemIcon>
        <ListItemText primary="Statistics (WIP)" />
      </ListItemButton>
    </React.Fragment>
  );
}

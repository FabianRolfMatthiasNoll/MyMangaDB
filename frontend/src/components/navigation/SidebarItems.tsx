import * as React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import PeopleIcon from "@mui/icons-material/People";
import BookIcon from "@mui/icons-material/Book";
import AccountTreeIcon from "@mui/icons-material/AccountTree";

export const SidebarItems = (
  <React.Fragment>
    <ListItemButton>
      <ListItemIcon>
        <BookIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="Authors" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <AccountTreeIcon />
      </ListItemIcon>
      <ListItemText primary="Genres" />
    </ListItemButton>
  </React.Fragment>
);

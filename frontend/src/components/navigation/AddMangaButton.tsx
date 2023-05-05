import { useState } from "react";
import {
  Box,
  Fab,
  Modal,
  Paper,
  Switch,
  Toolbar,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Manga } from "../../api/models";
import AddManga from "../manga/add_manga/AddManga";

const defaultManga: Manga = {
  id: 0,
  title: "",
  description: "",
  totalVolumes: 0,
  volumes: [],
  authors: [],
  genres: [],
  coverImage: "",
};

export default function AddMangaButton() {
  const [open, setOpen] = useState(false);
  const [manualMode, setManualMode] = useState(true);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: (theme) => theme.spacing(2),
        right: (theme) => theme.spacing(2),
      }}
    >
      <Fab color="primary" aria-label="add" onClick={handleClickOpen}>
        <AddIcon />
      </Fab>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="manga-modal-title"
        aria-describedby="manga-modal-description"
      >
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 5,
            overflow: "auto",
            maxWidth: "95vw", // or any other value
            maxHeight: "95vh", // or any other value
            width: "90vw",
          }}
        >
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" component="h2" mb={2}>
              Add new Manga
            </Typography>
            <Switch
              checked={manualMode}
              onChange={() => setManualMode(!manualMode)}
              color="primary"
            />
          </Toolbar>
          {manualMode ? (
            <>
              <AddManga onClose={handleClose} />
            </>
          ) : (
            <></>
          )}
        </Paper>
      </Modal>
    </Box>
  );
}

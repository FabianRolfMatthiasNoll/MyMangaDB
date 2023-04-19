import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Grid,
  IconButton,
  Switch,
  TextField,
  Toolbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { mangaAPI } from "../../api";
import { Manga } from "../../api/models";
import { useMutation, useQueryClient } from "react-query";
import AddMangaManual from "../manga/add_manga/AddMangaManual";
import AddMangaMAL from "../manga/add_manga/AddMangaMAL";

const defaultManga: Manga = {
  title: "",
  description: "",
  totalVolumes: 0,
  volumes: [],
  authors: [],
  genres: [],
};

const AddMangaButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [manga, setManga] = useState<Manga>(defaultManga);
  const [manualMode, setManualMode] = useState(true);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Manga
  ) => {
    setManga({ ...manga, [field]: e.target.value });
  };

  const handleManualSubmit = async () => {
    mutation.mutate(manga);
    // Reset manga state and close modal
    setManga(defaultManga);
    handleClose();
  };

  const handleMALSubmit = async (selectedManga: Manga) => {
    mutation.mutate(selectedManga);
    // Reset manga state and close modal
    setManga(defaultManga);
    handleClose();
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (manga: Manga) =>
      mangaAPI.createMangaMangaPost({ manga: manga }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GetAllMangas"] });
    },
  });

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
      <Dialog open={open} onClose={handleClose}>
        <Toolbar>
          <DialogTitle>Add New Manga</DialogTitle>
          <Switch
            checked={manualMode}
            onChange={() => setManualMode(!manualMode)}
            color="primary"
          />
        </Toolbar>
        <DialogContent>
          {manualMode ? (
            <AddMangaManual
              manga={manga}
              handleInputChange={handleInputChange}
            />
          ) : (
            <AddMangaMAL handleMALSubmit={handleMALSubmit} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {manualMode ? (
            <Button onClick={handleManualSubmit} color="primary">
              Save
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default AddMangaButton;

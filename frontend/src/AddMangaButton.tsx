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
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { mangaAPI } from "./api";
import { Manga } from "./api/models";
import { useMutation, useQueryClient } from "react-query";

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

  const handleSubmit = async () => {
    mutation.mutate(manga);
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
        <DialogTitle>
          Add New Manga
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                label="Title"
                fullWidth
                value={manga.title}
                onChange={(e) => handleInputChange(e, "title")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                value={manga.description}
                onChange={(e) => handleInputChange(e, "description")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Total Volumes"
                type="number"
                fullWidth
                value={manga.totalVolumes}
                onChange={(e) => handleInputChange(e, "totalVolumes")}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddMangaButton;

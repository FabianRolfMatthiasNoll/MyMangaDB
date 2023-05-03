import {
  Autocomplete,
  Box,
  Button,
  Grid,
  Modal,
  Paper,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import { Author, Genre, Manga } from "../../../api/models";
import { useState } from "react";
import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";

interface Props {
  manga: Manga;
  onClose: () => void;
}

export default function EditMangaModal({ manga, onClose }: Props) {
  const [updatedManga, setUpdatedManga] = useState<Manga>(manga);
  const [authors, setAuthors] = useState<Author[]>([
    { id: 0, name: "", role: "" },
  ]);
  const [genres, setGenres] = useState<Genre[]>([{ id: 0, name: "" }]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedManga({
      ...updatedManga,
      [event.target.name]: event.target.value,
    });
  };

  const addAuthor = () => {
    setAuthors([...authors, { id: 0, name: "", role: "" }]);
  };

  const removeAuthor = (index: number) => {
    const newAuthors = [...authors];
    newAuthors.splice(index, 1);
    setAuthors(newAuthors);
  };

  const addGenre = () => {
    setGenres([...genres, { id: 0, name: "" }]);
  };

  const removeGenre = (index: number) => {
    const newGenres = [...genres];
    newGenres.splice(index, 1);
    setGenres(newGenres);
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 5,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                label="Title"
                fullWidth
                name="title"
                value={updatedManga.title}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                name="description"
                value={updatedManga.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Total Volumes"
                type="number"
                fullWidth
                name="totalVolumes"
                value={updatedManga.totalVolumes}
                onChange={handleInputChange}
              />
            </Grid>
            {updatedManga.authors.map((author, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={`Author ${index + 1}`}
                    fullWidth
                    value={author.name}
                    name={`authors.${index}.name`}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label={`Role ${index + 1}`}
                    fullWidth
                    value={author.role}
                    name={`authors.${index}.role`}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={1} container alignItems="center">
                  <IconButton
                    aria-label="delete"
                    onClick={() => removeAuthor(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </React.Fragment>
            ))}
            {updatedManga.genres.map((genre, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12} sm={11}>
                  <TextField
                    label={`Genre ${index + 1}`}
                    fullWidth
                    value={genre.name}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={1} container alignItems="center">
                  <IconButton
                    aria-label="delete"
                    onClick={() => removeGenre(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Modal>
  );
}

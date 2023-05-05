import { Box, Button, Grid, Modal, Paper, TextField } from "@mui/material";
import { Author, Genre, Manga } from "../../../api/models";
import { useState } from "react";
import React from "react";
import { GenreInput } from "./GenreInput";
import { useMutation, useQueryClient } from "react-query";
import { mangaAPI } from "../../../api";
import AuthorInput from "./AuthorInput";

interface Props {
  manga: Manga;
  onClose: () => void;
}

export default function EditMangaModal({ manga, onClose }: Props) {
  const [updatedManga, setUpdatedManga] = useState<Manga>(manga);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedManga({
      ...updatedManga,
      [event.target.name]: event.target.value,
    });
  };

  const handleGenresChange = (newGenres: Genre[]) => {
    setUpdatedManga({
      ...updatedManga,
      genres: newGenres,
    });
  };

  const handleAuthorChange = (
    index: number,
    field: "name" | "role",
    value: string
  ) => {
    setUpdatedManga((prevUpdatedManga) => {
      const updatedAuthors = prevUpdatedManga.authors.map((author, i) => {
        if (i === index) {
          return {
            ...author,
            [field]: value,
          };
        }
        return author;
      });

      return {
        ...prevUpdatedManga,
        authors: updatedAuthors,
      };
    });
  };

  const removeAuthor = (index: number) => {
    setUpdatedManga((prevUpdatedManga) => {
      const updatedAuthors = prevUpdatedManga.authors.filter(
        (_, i) => i !== index
      );
      return {
        ...prevUpdatedManga,
        authors: updatedAuthors,
      };
    });
  };

  const addAuthor = () => {
    setUpdatedManga((prevUpdatedManga) => {
      const newAuthor: Author = { id: 0, name: "", role: "" }; // You can set the initial values as needed
      return {
        ...prevUpdatedManga,
        authors: [...prevUpdatedManga.authors, newAuthor],
      };
    });
  };

  const handleSubmit = async () => {
    mutation.mutate(updatedManga);
    onClose();
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (manga: Manga) =>
      mangaAPI.updateMangaMangaUpdateMangaPut({ manga: manga }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GetAllMangas"] });
    },
  });

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
                multiline
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
            <Grid item xs={12} sm={11}>
              <GenreInput
                initialGenres={updatedManga.genres}
                onGenresChange={handleGenresChange}
              />
            </Grid>
            {updatedManga.authors.map((author, index) => (
              <AuthorInput
                author={author}
                index={index}
                handleAuthorChange={handleAuthorChange}
                removeAuthor={removeAuthor}
              />
            ))}
          </Grid>
        </Box>
        <Button onClick={addAuthor}>Add Author</Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </Paper>
    </Modal>
  );
}

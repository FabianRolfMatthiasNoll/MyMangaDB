import {
  Box,
  Button,
  Grid,
  Modal,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Author, Genre, Manga } from "../../../api/models";
import { useState } from "react";
import React from "react";
import { GenreInput } from "./GenreInput";
import { useMutation, useQueryClient } from "react-query";
import { mangaAPI, mangaJikanAPI } from "../../../api";
import AuthorInput from "./AuthorInput";

interface Props {
  manga: Manga;
  onClose: () => void;
}

export default function EditMangaModal({ manga, onClose }: Props) {
  const [updatedManga, setUpdatedManga] = useState<Manga>(manga);
  const [coverImage, setCoverImage] = useState<string | null>(
    updatedManga.coverImage
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        let base64String = reader.result as string;
        base64String = base64String.replace(/^data:image\/[a-z]+;base64,/, "");
        setCoverImage(base64String);
        setUpdatedManga({
          ...updatedManga,
          coverImage: base64String,
        });
      };
    }
  };

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

  const handleAuthorChange = (index: number, field: "name", value: string) => {
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
      const newAuthor: Author = { id: 0, name: "" }; // You can set the initial values as needed
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

  const sendJikan = useMutation({
    mutationFn: (manga: Manga) =>
      mangaJikanAPI.updateMangaWithJikanJikanUpdatePut({
        manga: manga,
      }),
    onSuccess: (data) => {
      setUpdatedManga(data);
      setCoverImage(data.coverImage);
    },
  });

  const handleUpdate = async () => {
    sendJikan.mutate(updatedManga);
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
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            mb: 5,
          }}
        >
          <Grid container spacing={2}>
            {/* Left Column - Modern Image Uploader */}
            <Grid item sm="auto">
              <Box
                sx={{
                  width: `calc(0.8 * 80vh * 2/3)`, // 2:3 ratio, width is 2/3 of height
                  height: `calc(0.8 * 80vh)`, // 80% of 80vh
                  border: coverImage ? "none" : "2px dashed gray",
                  backgroundImage: coverImage
                    ? `url(data:image/jpeg;base64,${coverImage})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {!coverImage && <Typography>↑</Typography>}{" "}
                {/* Replace with upload icon */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                  }}
                />
              </Box>
            </Grid>

            {/* Right Column - All other fields */}
            <Grid item sm={true}>
              <Box mb={2}>
                <TextField
                  required
                  label="Title"
                  fullWidth
                  name="title"
                  value={updatedManga.title}
                  onChange={handleInputChange}
                />
              </Box>
              <Box mb={2}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  name="description"
                  value={updatedManga.description}
                  onChange={handleInputChange}
                />
              </Box>
              <Box mb={2}>
                <TextField
                  label="Total Volumes"
                  type="number"
                  fullWidth
                  name="totalVolumes"
                  value={updatedManga.totalVolumes}
                  onChange={handleInputChange}
                />
              </Box>
              <Box mb={2}>
                <GenreInput
                  initialGenres={updatedManga.genres}
                  onGenresChange={handleGenresChange}
                />
              </Box>
              {updatedManga.authors.map((author, index) => (
                <React.Fragment key={index}>
                  <AuthorInput
                    author={author}
                    index={index}
                    handleAuthorChange={handleAuthorChange}
                    removeAuthor={removeAuthor}
                  />
                </React.Fragment>
              ))}
            </Grid>
          </Grid>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              width: "100%",
              mt: 3,
              mb: -7, // Adjust this value as needed
            }}
          >
            <Button onClick={addAuthor}>Add Author</Button>
            <Button onClick={handleUpdate}>Update</Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
}

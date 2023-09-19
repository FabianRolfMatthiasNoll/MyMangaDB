import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import React, { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "react-query";
import { Author, Genre, Manga } from "../../../api/models";
import { mangaAPI } from "../../../api";
import AuthorInput from "../edit_manga/AuthorInput";
import { GenreInput } from "../edit_manga/GenreInput";

interface Props {
  onClose: () => void;
}

const defaultManga: Manga = {
  id: 0,
  title: "",
  description: "",
  totalVolumes: 0,
  volumes: [],
  authors: [],
  genres: [],
  coverImage: "",
  readingStatus: "not_set",
  collectionStatus: "not_set"
};

export default function AddManga({ onClose }: Props) {
  const [updatedManga, setUpdatedManga] = useState<Manga>(defaultManga);
  const { title, description, totalVolumes, genres, authors, coverImage } =
    updatedManga;

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          const base64String = (reader.result as string).replace(
            /^data:image\/[a-z]+;base64,/,
            ""
          );
          setUpdatedManga((prev) => ({ ...prev, coverImage: base64String }));
        };
      }
    },
    []
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setUpdatedManga((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleGenresChange = useCallback((newGenres: Genre[]) => {
    setUpdatedManga((prev) => ({ ...prev, genres: newGenres }));
  }, []);

  const handleAuthorChange = useCallback(
    (index: number, field: "name" | "role", value: string) => {
      setUpdatedManga((prev) => {
        const updatedAuthors = prev.authors.map((author, i) =>
          i === index ? { ...author, [field]: value } : author
        );
        return { ...prev, authors: updatedAuthors };
      });
    },
    []
  );

  const removeAuthor = useCallback((index: number) => {
    setUpdatedManga((prev) => {
      const updatedAuthors = prev.authors.filter((_, i) => i !== index);
      return { ...prev, authors: updatedAuthors };
    });
  }, []);

  const addAuthor = useCallback(() => {
    const newAuthor: Author = { id: 0, name: ""};
    setUpdatedManga((prev) => ({
      ...prev,
      authors: [...prev.authors, newAuthor],
    }));
  }, []);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (manga: Manga) => mangaAPI.createMangaMangaPost({ manga }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GetAllMangas"] });
    },
  });

  const handleSubmit = useCallback(async () => {
    mutation.mutate(updatedManga);
    onClose();
  }, [updatedManga, mutation, onClose]);

  return (
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
              width: `calc(0.8 * 45vh * 2/3)`,
              height: `calc(0.8 * 45vh)`,
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
            {!coverImage && <Typography>↑</Typography>}
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
              value={title}
              onChange={handleInputChange}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Description"
              fullWidth
              multiline
              name="description"
              value={description}
              onChange={handleInputChange}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Total Volumes"
              type="number"
              fullWidth
              name="totalVolumes"
              value={totalVolumes}
              onChange={handleInputChange}
            />
          </Box>
          <Box mb={2}>
            <GenreInput
              initialGenres={genres}
              onGenresChange={handleGenresChange}
            />
          </Box>
          {authors.map((author, index) => (
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
          mb: -7,
        }}
      >
        <Button onClick={addAuthor}>Add Author</Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </Box>
    </Box>
  );
}

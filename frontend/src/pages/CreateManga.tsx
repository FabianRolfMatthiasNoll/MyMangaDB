import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Paper,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MangaForm from "../components/MangaForm";
import { Manga, MangaCreate, Category } from "../api/models";
import { createManga } from "../services/apiService";
import { getMangaCoverImageUrl } from "../services/apiService";

const CreateManga: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const initialManga: Manga = {
    id: 0,
    title: "",
    japaneseTitle: "",
    readingStatus: null,
    overallStatus: null,
    starRating: null,
    language: "",
    category: Category.Manga,
    summary: "",
    coverImage: "",
    authors: [],
    genres: [],
    lists: [],
    volumes: [],
  };

  const handleSave = async (manga: Manga, coverImage?: File) => {
    try {
      let coverImagePath = "";
      if (coverImage) {
        // Create a unique filename using UUID and .jpg extension
        const uniqueFilename = `${crypto.randomUUID()}.jpg`;
        coverImagePath = uniqueFilename;

        // Save the file to the backend's image directory
        const formData = new FormData();
        formData.append('file', coverImage);
        formData.append('filename', uniqueFilename);

        const response = await fetch('http://localhost:8000/api/v1/images/manga/save', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to save cover image');
        }

        // Wait for the response to ensure the file is saved
        const result = await response.json();
        if (!result.filename) {
          throw new Error('Failed to get filename from server');
        }
        coverImagePath = result.filename;
      }

      const mangaCreate: MangaCreate = {
        title: manga.title,
        japaneseTitle: manga.japaneseTitle || null,
        readingStatus: manga.readingStatus || null,
        overallStatus: manga.overallStatus || null,
        starRating: manga.starRating || null,
        language: manga.language || null,
        category: manga.category,
        summary: manga.summary || null,
        coverImage: coverImagePath || null,
        authors: manga.authors.map(author => ({ name: author.name })),
        genres: manga.genres.map(genre => ({ name: genre.name })),
        lists: manga.lists.map(list => ({ name: list.name })),
        volumes: [],
      };

      const createdManga = await createManga(mangaCreate);
      if (createdManga) {
        navigate(`/manga/${createdManga.id}`);
      }
    } catch (error) {
      console.error("Error creating manga:", error);
      alert("Failed to create manga. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          background: theme.palette.mode === "dark"
            ? alpha(theme.palette.background.paper, 0.8)
            : alpha(theme.palette.background.paper, 0.9),
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton
            onClick={handleCancel}
            sx={{ mr: 2 }}
            aria-label="back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Create New Manga
          </Typography>
        </Box>
        <MangaForm
          manga={initialManga}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </Paper>
    </Container>
  );
};

export default CreateManga; 
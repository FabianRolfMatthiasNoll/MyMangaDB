import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Paper,
  IconButton,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MangaForm from "../components/MangaForm";
import { Manga, MangaCreate, Category } from "../api/models";
import { createManga } from "../services/mangaService";
import { saveMangaCover } from "../services/imageService";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const CreateManga: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [selectedLists, setSelectedLists] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    // Get listId from URL if present
    const params = new URLSearchParams(location.search);
    const listId = params.get('listId');
    if (listId) {
      setSelectedLists([Number(listId)]);
    }
  }, [location]);

  const handleSave = async (manga: Manga, coverImage?: File) => {
    try {
      let coverImagePath = "";
      if (coverImage) {
        // Create a unique filename using UUID and .jpg extension
        const uniqueFilename = `${crypto.randomUUID()}.jpg`;
        coverImagePath = await saveMangaCover(coverImage, uniqueFilename);
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
        await queryClient.invalidateQueries({ queryKey: ["mangas"] });
        await queryClient.invalidateQueries({ queryKey: ["lists"] });
        navigate(`/manga/${createdManga.id}`);
      }
    } catch (error) {
      console.error("Error creating manga:", error);
      setError(t("errors.failedToCreateManga"));
    }
  };

  return (
    <Container maxWidth="md">
      <Box p={3}>
        <Paper elevation={0} sx={{ p: 3, backgroundColor: 'transparent' }}>
          <Box display="flex" alignItems="center" mb={3}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                mr: 2,
                backgroundColor: 'background.paper',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {t("manga.addNewManga")}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <MangaForm
            manga={initialManga}
            onSave={handleSave}
            onCancel={() => navigate(-1)}
            initialLists={selectedLists}
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateManga;

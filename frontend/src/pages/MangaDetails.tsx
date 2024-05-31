import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { getMangaCoverImageUrl, getMangaDetails } from "../services/apiService";
import { Manga } from "../api/models";

const MangaDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [manga, setManga] = useState<Manga | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);

  useEffect(() => {
    const fetchManga = async () => {
      if (id) {
        const mangaData = await getMangaDetails(Number(id));
        setManga(mangaData);
      }
    };

    fetchManga();
  }, [id]);

  if (!manga) {
    return <div>Loading...</div>;
  }

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleSaveChanges = () => {
    // Endpoint to update the manga details
    // updateMangaDetails(manga).then(response => {
    //   // handle response
    // });
    setEditMode(false);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <img
            src={getMangaCoverImageUrl(manga.coverImage) || ""}
            alt={manga.title}
            style={{ width: "100%" }}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {editMode ? (
              <>
                <TextField label="Title" value={manga.title} fullWidth />
                <TextField
                  label="Japanese Title"
                  value={manga.japaneseTitle || ""}
                  fullWidth
                />
                <TextField
                  label="Authors"
                  value={manga.authors.map((author) => author.name).join(", ")}
                  fullWidth
                />
                <TextField
                  label="Genres"
                  value={manga.genres.map((genre) => genre.name).join(", ")}
                  fullWidth
                />
                <TextField
                  label="Summary"
                  value={manga.summary || ""}
                  fullWidth
                  multiline
                  rows={4}
                />
                <TextField
                  label="Language"
                  value={manga.language || ""}
                  fullWidth
                />
                <TextField label="Category" value={manga.category} fullWidth />
                <TextField
                  label="Reading Status"
                  value={manga.readingStatus || ""}
                  fullWidth
                />
                <TextField
                  label="Overall Status"
                  value={manga.overallStatus || ""}
                  fullWidth
                />
                <TextField
                  label="Star Rating"
                  value={manga.starRating?.toString() || ""}
                  fullWidth
                />
                <Button variant="contained" onClick={handleSaveChanges}>
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Typography variant="h6">{manga.title}</Typography>
                <Typography variant="subtitle1">
                  Japanese Title: {manga.japaneseTitle || "N/A"}
                </Typography>
                <Typography variant="subtitle1">
                  Authors:{" "}
                  {manga.authors.map((author) => author.name).join(", ")}
                </Typography>
                <Typography variant="subtitle1">
                  Genres: {manga.genres.map((genre) => genre.name).join(", ")}
                </Typography>
                <Typography variant="subtitle1">
                  Summary: {manga.summary || "N/A"}
                </Typography>
                <Typography variant="subtitle1">
                  Language: {manga.language || "N/A"}
                </Typography>
                <Typography variant="subtitle1">
                  Category: {manga.category}
                </Typography>
                <Typography variant="subtitle1">
                  Reading Status: {manga.readingStatus || "N/A"}
                </Typography>
                <Typography variant="subtitle1">
                  Overall Status: {manga.overallStatus || "N/A"}
                </Typography>
                <Typography variant="subtitle1">
                  Star Rating: {manga.starRating?.toString() || "N/A"}
                </Typography>
                <Button variant="contained" onClick={handleToggleEditMode}>
                  Edit
                </Button>
              </>
            )}
          </Box>
        </Grid>
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Volumes</Typography>
        {/* Endpoint to fetch volumes */}
        {/* <Volumes mangaId={manga.id} /> */}
      </Box>
    </Container>
  );
};

export default MangaDetails;

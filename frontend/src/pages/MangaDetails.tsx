import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Grid,
  Box,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Rating,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  getMangaCoverImageUrl,
  getMangaDetails,
  updateMangaDetails,
} from "../services/apiService";
import { Manga } from "../api/models";
import MangaForm from "../components/MangaForm";

const MangaDetails: React.FC = () => {
  const navigate = useNavigate();

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

  const handleSaveChanges = async (updatedManga: Manga) => {
    const savedManga = await updateMangaDetails(updatedManga);
    setManga(savedManga);
    setEditMode(false);
    alert("Changes saved successfully!");
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBackClick}
        sx={{ my: 2 }}
      >
        Zurück
      </Button>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          {manga.coverImage ? (
            <img
              src={getMangaCoverImageUrl(manga.coverImage) || ""}
              alt={manga.title}
              style={{ width: "100%" }}
            />
          ) : (
            <img src={""} alt={manga.title} style={{ width: "100%" }} />
          )}
        </Grid>
        <Grid item xs={12} md={8}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {editMode ? (
              <MangaForm
                manga={manga}
                onSave={handleSaveChanges}
                onCancel={handleToggleEditMode}
              />
            ) : (
              <>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Title
                      </TableCell>
                      <TableCell>{manga.title}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Japanese Title
                      </TableCell>
                      <TableCell>{manga.japaneseTitle || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Authors
                      </TableCell>
                      <TableCell>
                        {manga.authors.map((author) => (
                          <Chip
                            key={author.id}
                            label={author.name}
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Genres
                      </TableCell>
                      <TableCell>
                        {manga.genres.map((genre) => (
                          <Chip
                            key={genre.id}
                            label={genre.name}
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Summary
                      </TableCell>
                      <TableCell>{manga.summary || "N/A"}</TableCell>
                    </TableRow>
                    {manga.lists.length > 0 ? (
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Lists
                        </TableCell>
                        <TableCell>
                          {manga.lists.map((list) => (
                            <Chip
                              key={list.id}
                              label={list.name}
                              sx={{ mr: 1, mb: 1 }}
                            />
                          )) || "No Lists assigned"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      <></>
                    )}

                    <TableRow>
                      <TableCell component="th" scope="row">
                        Language
                      </TableCell>
                      <TableCell>{manga.language || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Category
                      </TableCell>
                      <TableCell>{manga.category}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Reading Status
                      </TableCell>
                      <TableCell>{manga.readingStatus || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Overall Status
                      </TableCell>
                      <TableCell>{manga.overallStatus || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Star Rating
                      </TableCell>
                      <TableCell>
                        <Rating
                          value={manga.starRating || 0}
                          precision={0.5}
                          readOnly
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
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

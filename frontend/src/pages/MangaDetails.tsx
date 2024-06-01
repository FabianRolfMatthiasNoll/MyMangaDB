import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Rating,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  getMangaCoverImageUrl,
  getMangaDetails,
  updateMangaDetails,
  getAvailableAuthors,
  getAvailableGenres,
} from "../services/apiService";
import { Author, Genre, Manga } from "../api/models";
import { OverallStatus, ReadingStatus } from "../api/models";

const MangaDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [manga, setManga] = useState<Manga | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editableManga, setEditableManga] = useState<Manga | null>(null);
  const [availableAuthors, setAvailableAuthors] = useState<Author[]>([]);
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);

  useEffect(() => {
    const fetchManga = async () => {
      if (id) {
        const mangaData = await getMangaDetails(Number(id));
        setManga(mangaData);
        setEditableManga(mangaData);
      }
    };

    const getAuthors = async () => {
      const authors = await getAvailableAuthors();
      setAvailableAuthors(authors);
    };

    const getGenres = async () => {
      const genres = await getAvailableGenres();
      setAvailableGenres(genres);
    };

    fetchManga();
    getAuthors();
    getGenres();
  }, [id]);

  if (!manga) {
    return <div>Loading...</div>;
  }

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
    setEditableManga(manga);
  };

  const handleSaveChanges = async () => {
    if (editableManga) {
      const updatedManga = await updateMangaDetails(editableManga);
      setManga(updatedManga);
      setEditMode(false);
      alert("Changes saved successfully!");
    }
  };

  const handleChange = (field: keyof Manga, value: any) => {
    if (editableManga) {
      setEditableManga({ ...editableManga, [field]: value });
    }
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
                <TextField
                  label="Title"
                  value={editableManga?.title || ""}
                  fullWidth
                  onChange={(e) => handleChange("title", e.target.value)}
                />
                <TextField
                  label="Japanese Title"
                  value={editableManga?.japaneseTitle || ""}
                  fullWidth
                  onChange={(e) =>
                    handleChange("japaneseTitle", e.target.value)
                  }
                />
                <Autocomplete
                  multiple
                  options={availableAuthors}
                  getOptionLabel={(option) => option.name}
                  filterSelectedOptions
                  value={editableManga?.authors || []}
                  onChange={(_, newValue) => handleChange("authors", newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Authors"
                      placeholder="Add authors"
                      fullWidth
                    />
                  )}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip
                        label={option.name}
                        {...getTagProps({ index })}
                        key={option.id}
                      />
                    ))
                  }
                />
                <Autocomplete
                  multiple
                  options={availableGenres}
                  getOptionLabel={(option) => option.name}
                  filterSelectedOptions
                  value={editableManga?.genres || []}
                  onChange={(_, newValue) => handleChange("genres", newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Genres"
                      placeholder="Add genres"
                      fullWidth
                    />
                  )}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip
                        label={option.name}
                        {...getTagProps({ index })}
                        key={option.id}
                      />
                    ))
                  }
                />
                <TextField
                  label="Summary"
                  value={editableManga?.summary || ""}
                  fullWidth
                  multiline
                  rows={4}
                  onChange={(e) => handleChange("summary", e.target.value)}
                />
                <TextField
                  label="Language"
                  value={editableManga?.language || ""}
                  fullWidth
                  onChange={(e) => handleChange("language", e.target.value)}
                />
                <TextField
                  label="Category"
                  value={editableManga?.category || ""}
                  fullWidth
                  onChange={(e) => handleChange("category", e.target.value)}
                />
                <FormControl fullWidth>
                  <InputLabel>Reading Status</InputLabel>
                  <Select
                    value={editableManga?.readingStatus || ""}
                    onChange={(e) =>
                      handleChange("readingStatus", e.target.value)
                    }
                  >
                    {Object.entries(ReadingStatus).map(([key, value]) => (
                      <MenuItem key={key} value={value}>
                        {key}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Overall Status</InputLabel>
                  <Select
                    value={editableManga?.overallStatus || ""}
                    onChange={(e) =>
                      handleChange("overallStatus", e.target.value)
                    }
                  >
                    {Object.entries(OverallStatus).map(([key, value]) => (
                      <MenuItem key={key} value={value}>
                        {key}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box>
                  <Typography>Star Rating</Typography>
                  <Rating
                    name="star-rating"
                    value={editableManga?.starRating || 0}
                    precision={0.5}
                    onChange={(_e, newValue) =>
                      handleChange("starRating", newValue || 0)
                    }
                  />
                </Box>
                <Button variant="contained" onClick={handleSaveChanges}>
                  Save Changes
                </Button>
              </>
            ) : (
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
            )}
            {!editMode && (
              <Button variant="contained" onClick={handleToggleEditMode}>
                Edit
              </Button>
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

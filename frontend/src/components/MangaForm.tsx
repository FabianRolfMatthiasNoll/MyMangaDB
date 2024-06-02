import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Chip,
  Rating,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from "@mui/material";
import { Author, Genre, Manga } from "../api/models";
import { OverallStatus, ReadingStatus } from "../api/models";
import {
  getAvailableAuthors,
  getAvailableGenres,
} from "../services/apiService";

interface MangaFormProps {
  manga: Manga;
  onSave: (manga: Manga) => void;
  onCancel: () => void;
}

const MangaForm: React.FC<MangaFormProps> = ({ manga, onSave, onCancel }) => {
  const [editableManga, setEditableManga] = useState<Manga>(manga);
  const [availableAuthors, setAvailableAuthors] = useState<Author[]>([]);
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);

  useEffect(() => {
    const getAuthors = async () => {
      const authors = await getAvailableAuthors();
      setAvailableAuthors(authors);
    };

    const getGenres = async () => {
      const genres = await getAvailableGenres();
      setAvailableGenres(genres);
    };

    getAuthors();
    getGenres();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (field: keyof Manga, value: any) => {
    setEditableManga({ ...editableManga, [field]: value });
  };

  const handleSave = () => {
    onSave(editableManga);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAuthorsChange = (_: any, newValue: any[]) => {
    const authors = newValue.reduce((acc, option) => {
      if (typeof option === "string") {
        const existingAuthor = availableAuthors.find(
          (author) => author.name.toLowerCase() === option.toLowerCase()
        );
        if (existingAuthor) {
          acc.push(existingAuthor);
        } else {
          acc.push({ id: 0, name: option });
        }
      } else {
        acc.push(option);
      }
      return acc;
    }, []);
    handleChange("authors", authors);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleGenresChange = (_: any, newValue: any[]) => {
    const genres = newValue.reduce((acc, option) => {
      if (typeof option === "string") {
        const existingGenre = availableGenres.find(
          (genre) => genre.name.toLowerCase() === option.toLowerCase()
        );
        if (existingGenre) {
          acc.push(existingGenre);
        } else {
          acc.push({ id: 0, name: option });
        }
      } else {
        acc.push(option);
      }
      return acc;
    }, []);
    handleChange("genres", genres);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        label="Title"
        value={editableManga.title}
        fullWidth
        onChange={(e) => handleChange("title", e.target.value)}
      />
      <TextField
        label="Japanese Title"
        value={editableManga.japaneseTitle || ""}
        fullWidth
        onChange={(e) => handleChange("japaneseTitle", e.target.value)}
      />
      <Autocomplete
        multiple
        freeSolo
        options={availableAuthors}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.name
        }
        filterSelectedOptions
        value={editableManga.authors}
        onChange={handleAuthorsChange}
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
        freeSolo
        options={availableGenres}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.name
        }
        filterSelectedOptions
        value={editableManga.genres}
        onChange={handleGenresChange}
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
        value={editableManga.summary || ""}
        fullWidth
        multiline
        rows={4}
        onChange={(e) => handleChange("summary", e.target.value)}
      />
      <TextField
        label="Language"
        value={editableManga.language || ""}
        fullWidth
        onChange={(e) => handleChange("language", e.target.value)}
      />
      <TextField
        label="Category"
        value={editableManga.category || ""}
        fullWidth
        onChange={(e) => handleChange("category", e.target.value)}
      />
      <FormControl fullWidth>
        <InputLabel>Reading Status</InputLabel>
        <Select
          label=""
          value={editableManga.readingStatus || ""}
          onChange={(e) => handleChange("readingStatus", e.target.value)}
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
          value={editableManga.overallStatus || ""}
          onChange={(e) => handleChange("overallStatus", e.target.value)}
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
          value={editableManga.starRating || 0}
          precision={0.5}
          onChange={(_e, newValue) => handleChange("starRating", newValue || 0)}
        />
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default MangaForm;

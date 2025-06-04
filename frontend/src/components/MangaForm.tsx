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
import { Author, Genre, Manga, ListModel, Category } from "../api/models";
import { OverallStatus, ReadingStatus } from "../api/models";
import {
  getAvailableAuthors,
  getAvailableGenres,
  getAvailableLists,
} from "../services/apiService";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface MangaFormProps {
  manga: Manga;
  onSave: (manga: Manga, coverImage?: File) => void;
  onCancel: () => void;
  initialLists?: number[];
}

const MangaForm: React.FC<MangaFormProps> = ({ manga, onSave, onCancel, initialLists = [] }) => {
  const [editableManga, setEditableManga] = useState<Manga>(manga);
  const [availableAuthors, setAvailableAuthors] = useState<Author[]>([]);
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
  const [availableLists, setAvailableLists] = useState<ListModel[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedLists, setSelectedLists] = useState<number[]>(() => {
    return initialLists.length > 0 ? initialLists : manga.lists.map(list => list.id);
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authors, genres, lists] = await Promise.all([
          getAvailableAuthors(),
          getAvailableGenres(),
          getAvailableLists()
        ]);
        setAvailableAuthors(authors);
        setAvailableGenres(genres);
        setAvailableLists(lists);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (field: keyof Manga, value: any) => {
    setEditableManga({ ...editableManga, [field]: value });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleListsChange = (_event: React.SyntheticEvent, newValue: ListModel[]) => {
    setSelectedLists(newValue.map(list => list.id));
  };

  const handleSave = () => {
    const mangaToSave = {
      ...editableManga,
      lists: availableLists.filter(list => selectedLists.includes(list.id))
    };
    onSave(mangaToSave, coverImage || undefined);
  };

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
        required
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
      <Autocomplete
        multiple
        options={availableLists}
        getOptionLabel={(option) => option.name}
        value={availableLists.filter(list => selectedLists.includes(list.id))}
        onChange={handleListsChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Lists"
            margin="normal"
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
      <FormControl fullWidth>
        <InputLabel>Category</InputLabel>
        <Select
          label="Category"
          value={editableManga.category || ""}
          onChange={(e) => handleChange("category", e.target.value)}
        >
          {Object.entries(Category).map(([key, value]) => (
            <MenuItem key={key} value={value}>
              {key}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Reading Status</InputLabel>
        <Select
          label="Reading Status"
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
          label="Overall Status"
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
      <Box>
        <Button
          component="label"
          variant="outlined"
          startIcon={<CloudUploadIcon />}
        >
          Upload Cover Image
          <VisuallyHiddenInput type="file" onChange={handleImageChange} accept="image/*" />
        </Button>
        {previewUrl && (
          <Box
            component="img"
            src={previewUrl}
            alt="Cover preview"
            sx={{
              maxWidth: "200px",
              maxHeight: "300px",
              objectFit: "contain",
              alignSelf: "center",
            }}
          />
        )}
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

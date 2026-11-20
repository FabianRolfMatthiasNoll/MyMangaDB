import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Author, Genre, Manga, ListModel, Category } from "../api/models";
import { OverallStatus, OwnershipStatus, ReadingStatus } from "../api/models";
import { getAuthors } from "../services/authorService";
import { getGenres } from "../services/genreService";
import { getAllLists } from "../services/listService";
import { useStatusMeta } from "../hooks/useStatusMeta";
import { useCategoryLabel } from "../hooks/useCategoryLabel";
import { useOwnershipStatus } from "../hooks/useOwnershipStatus";
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

const MangaForm: React.FC<MangaFormProps> = ({
  manga,
  onSave,
  onCancel,
  initialLists = [],
}) => {
  const { t } = useTranslation();
  const { getStatusLabel } = useStatusMeta();
  const getCategoryLabel = useCategoryLabel();
  const { getOwnershipLabel } = useOwnershipStatus();
  const [editableManga, setEditableManga] = useState<Manga>(manga);
  const [availableAuthors, setAvailableAuthors] = useState<Author[]>([]);
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
  const [availableLists, setAvailableLists] = useState<ListModel[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedLists, setSelectedLists] = useState<ListModel[]>(manga.lists);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authors, genres, lists] = await Promise.all([
          getAuthors(),
          getGenres(),
          getAllLists(),
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

  useEffect(() => {
    if (
      initialLists.length > 0 &&
      availableLists.length > 0 &&
      selectedLists.length === 0
    ) {
      const preselected = availableLists.filter((l) =>
        initialLists.includes(l.id)
      );
      setSelectedLists(preselected);
    }
  }, [availableLists, initialLists]);

  const handleChange = (field: keyof Manga, value: Manga[keyof Manga]) => {
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

  const handleListsChange = (
    _event: React.SyntheticEvent,
    newValue: (ListModel | string)[]
  ) => {
    const lists = newValue.reduce((acc: ListModel[], option) => {
      if (typeof option === "string") {
        const existingList = availableLists.find(
          (list) => list.name.toLowerCase() === option.toLowerCase()
        );
        if (existingList) {
          acc.push(existingList);
        } else {
          acc.push({ id: 0, name: option });
        }
      } else {
        acc.push(option);
      }
      return acc;
    }, []);
    setSelectedLists(lists);
  };

  const handleSave = () => {
    const mangaToSave = {
      ...editableManga,
      lists: selectedLists,
    };
    onSave(mangaToSave, coverImage || undefined);
  };

  const handleAuthorsChange = (_: unknown, newValue: (Author | string)[]) => {
    const authors = newValue.reduce((acc: Author[], option) => {
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

  const handleGenresChange = (_: unknown, newValue: (Genre | string)[]) => {
    const genres = newValue.reduce((acc: Genre[], option) => {
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
        label={t("manga.title")}
        value={editableManga.title}
        fullWidth
        required
        onChange={(e) => handleChange("title", e.target.value)}
      />
      <TextField
        label={t("manga.japaneseTitle")}
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
            label={t("manga.addAuthors")}
            placeholder={t("manga.addAuthors")}
            fullWidth
          />
        )}
        renderValue={(tagValue, getItemProps) =>
          tagValue.map((option, index) => (
            <Chip
              label={typeof option === "string" ? option : option.name}
              {...getItemProps({ index })}
              key={typeof option === "string" ? option : option.id}
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
            label={t("manga.addGenres")}
            placeholder={t("manga.addGenres")}
            fullWidth
          />
        )}
        renderValue={(tagValue, getItemProps) =>
          tagValue.map((option, index) => (
            <Chip
              label={typeof option === "string" ? option : option.name}
              {...getItemProps({ index })}
              key={typeof option === "string" ? option : option.id}
            />
          ))
        }
      />
      <Autocomplete
        multiple
        freeSolo
        options={availableLists}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.name
        }
        filterSelectedOptions
        value={selectedLists}
        onChange={handleListsChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t("manga.addLists")}
            placeholder={t("manga.addLists")}
            fullWidth
          />
        )}
        renderValue={(tagValue, getItemProps) =>
          tagValue.map((option, index) => (
            <Chip
              label={typeof option === "string" ? option : option.name}
              {...getItemProps({ index })}
              key={typeof option === "string" ? option : option.id || index}
            />
          ))
        }
      />
      <TextField
        label={t("manga.summary")}
        value={editableManga.summary || ""}
        fullWidth
        multiline
        rows={4}
        onChange={(e) => handleChange("summary", e.target.value)}
      />
      <TextField
        label={t("manga.language")}
        value={editableManga.language || ""}
        fullWidth
        onChange={(e) => handleChange("language", e.target.value)}
      />
      <FormControl fullWidth>
        <InputLabel>{t("manga.category")}</InputLabel>
        <Select
          label={t("manga.category")}
          value={editableManga.category || ""}
          onChange={(e) => handleChange("category", e.target.value)}
        >
          {Object.values(Category).map((value) => (
            <MenuItem key={value} value={value}>
              {getCategoryLabel(value)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {t("manga.ownershipStatus")}
        </Typography>
        {/* A toggle group instead of a dropdown: there are only three
            choices and the current one should stay visible. */}
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={editableManga.ownershipStatus || OwnershipStatus.Owned}
          onChange={(_event, value) =>
            value && handleChange("ownershipStatus", value)
          }
        >
          {Object.values(OwnershipStatus).map((value) => (
            <ToggleButton key={value} value={value}>
              {getOwnershipLabel(value)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <FormControl fullWidth>
        <InputLabel>{t("manga.readingStatus")}</InputLabel>
        <Select
          label={t("manga.readingStatus")}
          value={editableManga.readingStatus || ""}
          onChange={(e) => handleChange("readingStatus", e.target.value)}
        >
          {Object.values(ReadingStatus).map((value) => (
            <MenuItem key={value} value={value}>
              {getStatusLabel(value)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>{t("manga.overallStatus")}</InputLabel>
        <Select
          label={t("manga.overallStatus")}
          value={editableManga.overallStatus || ""}
          onChange={(e) => handleChange("overallStatus", e.target.value)}
        >
          {Object.values(OverallStatus).map((value) => (
            <MenuItem key={value} value={value}>
              {getStatusLabel(value)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box>
        <Typography>{t("common.starRating")}</Typography>
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
          {t("manga.uploadCoverImage")}
          <VisuallyHiddenInput
            type="file"
            onChange={handleImageChange}
            accept="image/*"
          />
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
          {t("common.save")}
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
      </Box>
    </Box>
  );
};

export default MangaForm;

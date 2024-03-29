import React, { useEffect, useState } from "react";
import Autocomplete, {
  AutocompleteInputChangeReason,
} from "@mui/material/Autocomplete";
import { Genre } from "../../../api/models";
import { Chip, TextField } from "@mui/material";
import { useQuery } from "react-query";
import { mangaAPI } from "../../../api";

interface GenreInputProps {
  initialGenres: Genre[];
  onGenresChange: (genres: Genre[]) => void;
}

export const GenreInput: React.FC<GenreInputProps> = ({
  initialGenres,
  onGenresChange,
}) => {
  const [genres, setGenres] = useState<string[]>(
    initialGenres.map((genre) => genre.name)
  );
  const [inputValue, setInputValue] = useState<string>("");
  const [existingGenres, setExistingGenres] = useState<string[]>([]);

  useEffect(() => {
    const initialGenreNames = initialGenres.map((genre) => genre.name);
    if (JSON.stringify(genres) !== JSON.stringify(initialGenreNames)) {
      setGenres(initialGenreNames);
    }
  }, [initialGenres, genres]);

  const handleTagsChange = (event: any, newValue: string[]) => {
    setGenres((prevGenres) => {
      return newValue;
    });
  };

  const handleInputChange = (
    event: any,
    newInputValue: string,
    reason: AutocompleteInputChangeReason
  ) => {
    if (reason === "reset") {
      setInputValue("");
    } else {
      setInputValue(newInputValue);
    }
  };

  const stationQuery = useQuery({
    queryKey: "GetAllGenreTags",
    queryFn: () => mangaAPI.getAllGenreNamesMangaGenreGet(),
    onSuccess: (data) => setExistingGenres(data),
  });

  return (
    <Autocomplete
      multiple
      options={existingGenres}
      value={genres}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      freeSolo
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip variant="outlined" label={option} {...getTagProps({ index })} />
        ))
      }
      renderInput={(params) => (
        <TextField {...params} label="Genres" placeholder="Add a genre" />
      )}
      onChange={handleTagsChange}
    />
  );
};

import React, { useEffect, useState } from "react";
import Autocomplete, {
  AutocompleteInputChangeReason,
} from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Genre } from "../../../api/models";
import { Chip } from "@mui/material";

interface TagInputProps {
  initialGenres: Genre[];
  onGenresChange: (genres: Genre[]) => void;
}

export const TagInput: React.FC<TagInputProps> = ({
  initialGenres,
  onGenresChange,
}) => {
  const [genreTags, setGenreTags] = useState<string[]>(
    initialGenres.map((genre) => genre.name)
  );
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    const newGenres = genreTags.map((name, index) => ({ id: index + 1, name }));
    onGenresChange(newGenres);
  }, [genreTags, onGenresChange]);

  const handleTagsChange = (event: any, newValue: string[]) => {
    setGenreTags(newValue);
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
  //TODO: Give all available genres and list them with the options menu. MUI -> Autocomplete
  return (
    <Autocomplete
      multiple
      options={[]}
      value={genreTags}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      freeSolo
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip variant="outlined" label={option} {...getTagProps({ index })}>
            {option}
          </Chip>
        ))
      }
      renderInput={(params) => (
        <TextField {...params} label="Genres" placeholder="Add a genre" />
      )}
      onChange={handleTagsChange}
    />
  );
};

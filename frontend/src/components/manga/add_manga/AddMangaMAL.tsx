import React, { useState } from "react";
import { Manga } from "../../../api/models";
import {
  Button,
  Grid,
  MenuItem,
  Select,
  TextField,
  Toolbar,
  FormControl,
  SelectChangeEvent,
  InputLabel,
} from "@mui/material";
import { useQuery } from "react-query";
import { mangaAPI, mangaMALAPI } from "../../../api";

const defaultManga: Manga = {
  title: "",
  description: "",
  totalVolumes: 0,
  volumes: [],
  authors: [],
  genres: [],
};

type Props = {
  manga: Manga;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Manga
  ) => void;
};

const AddMangaMAL: React.FC<Props> = ({ manga, handleInputChange }) => {
  const [selectedManga, setSelectedManga] = useState<Manga>(defaultManga);
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [searchTitle, setSearchTitle] = useState("");

  const handleSelectChange = (event: SelectChangeEvent) => {
    const newSelectedManga = mangaList.find(
      (manga) => manga.title == event.target.value
    );
    if (newSelectedManga) {
      setSelectedManga(newSelectedManga);
    }
  };

  const handleSearchClick = async () => {
    stationQuery.refetch();
  };

  const handleSelectClick = async () => {};

  const stationQuery = useQuery({
    queryKey: "GetMALSearchResults",
    queryFn: () =>
      mangaMALAPI.getMangaResultsWithMalMalSearchMangaTitleGet({
        mangaTitle: searchTitle,
      }),
    onSuccess: (data) => setMangaList(data),
    enabled: false,
  });

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          required
          label="Title"
          fullWidth
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Toolbar>
          <Button onClick={handleSearchClick}>Search</Button>
        </Toolbar>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel id="select-label">Results</InputLabel>
          <Select
            labelId="select-label"
            label="Results"
            value={selectedManga.title}
            onChange={handleSelectChange}
          >
            {mangaList.map((manga, index) => (
              <MenuItem key={index} value={manga.title}>
                {manga.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Toolbar>
          <Button onClick={handleSelectClick}>Select</Button>
        </Toolbar>
      </Grid>
    </Grid>
  );
};

export default AddMangaMAL;

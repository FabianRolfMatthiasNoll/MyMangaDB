import React, { useState } from "react";
import { Manga } from "../../../api/models";
import {
  Button,
  Grid,
  MenuItem,
  Select,
  TextField,
  Toolbar,
} from "@mui/material";

type Props = {
  handleMALSubmit: (selectedManga: Manga) => void;
};

const AddMangaMAL: React.FC<Props> = ({ handleMALSubmit }) => {
  const [selectedManga, setSelectedManga] = useState<Manga | null>(null);
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [searchTitle, setSearchTitle] = useState("");

  const handleSelectChange = async () => {
    setSelectedManga(selectedManga || null);
  };

  const handleSearchClick = async () => {
    // Call the API to get a list of manga based on the entered title
    // For example:
    const mangaList = await fetch(
      `https://api.jikan.moe/v3/search/manga?q=${searchTitle}&limit=10`
    ).then((res) => res.json());
    setMangaList(mangaList.results || []);
  };

  const handleMALSubmitClick = () => {
    handleMALSubmit(selectedManga!);
  };

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
        <Select
          label="Title"
          fullWidth
          value={selectedManga?.title || ""}
          onChange={handleSelectChange}
        >
          {mangaList.map((manga, index) => (
            <MenuItem key={index} value={manga.title}>
              {manga.title}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      <Grid item xs={12}>
        <Toolbar>
          <Button onClick={() => setSelectedManga(null)}>Cancel</Button>
          <Button onClick={handleMALSubmitClick} color="primary">
            Save
          </Button>
        </Toolbar>
      </Grid>
    </Grid>
  );
};

export default AddMangaMAL;

import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import SortByAlphaRoundedIcon from "@mui/icons-material/SortByAlphaRounded";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import MangaCard from "../manga/display_manga/MangaCard";
import { Manga } from "../../api/models";
import { Button } from "@mui/material";

const GenreMangaList: React.FC<{ mangas: Manga[]; onBackToGenres: () => void }> = ({
  mangas,
  onBackToGenres,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("id");
  const [sortedMangas, setSortedMangas] = useState(mangas);

  useEffect(() => {
    let sortedMangas = [...mangas];
    if (sortType === "a-z") {
      sortedMangas.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortType === "z-a") {
      sortedMangas.sort((a, b) => b.title.localeCompare(a.title));
    } else {
      sortedMangas.sort((a, b) => a.id - b.id);
    }
    setSortedMangas(sortedMangas);
  }, [sortType, mangas]);

  const filteredMangas = sortedMangas.filter((manga) =>
    manga.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Button onClick={onBackToGenres}>Back to Genres</Button>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={10} sm={8} lg={9} xl={10}>
          <TextField
            label="Search manga"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid
          item
          xs={2}
          sm={4}
          lg={2.2}
          xl={2}
          sx={{ display: "flex", justifyContent: "flex-end" }}
        >
          <IconButton
            onClick={() => setSortType("a-z")}
            color={sortType === "a-z" ? "primary" : "default"}
          >
            <SortByAlphaIcon />
          </IconButton>
          <IconButton
            onClick={() => setSortType("z-a")}
            color={sortType === "z-a" ? "primary" : "default"}
          >
            <SortByAlphaRoundedIcon />
          </IconButton>
          <IconButton
            onClick={() => setSortType("id")}
            color={sortType === "id" ? "primary" : "default"}
          >
            <FormatListNumberedIcon />
          </IconButton>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        {filteredMangas.map((manga, index) => (
          <Grid item key={index} xs={6} md={3} lg={2.3} xl={2}>
            <MangaCard manga={manga} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default GenreMangaList;
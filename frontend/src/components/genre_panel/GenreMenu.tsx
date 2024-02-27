import React, { useState } from "react";
import { useQuery } from "react-query";
import { mangaAPI } from "../../api";
import { Manga } from "../../api/models";
import GenreMangaList from "./GenreMangaList";
import { Grid, Button } from "@mui/material";

const GenreMenu: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [mangas, setMangas] = useState<Manga[]>([]);

  const GenreQuery = useQuery("GetAllGenreNames", () =>
    mangaAPI.getAllGenreNamesMangaGenreGet()
  );

  const GenreMangaQuery = useQuery(
    ["GetAllMangasByGenre", selectedGenre],
    () => {
      if (selectedGenre === null) {
        return [];
      }
      return mangaAPI.getMangasByGenreMangaGenreGenreNameGet({
        genreName: selectedGenre,
      });
    },
    {
      onSuccess: (data) => setMangas(data),
    }
  );

  const handleBackToGenres = () => {
    setSelectedGenre(null);
  };

  if (GenreQuery.isLoading) {
    return <div>Loading genres...</div>;
  }

  if (GenreQuery.isError) {
    console.error(GenreQuery.error);
    return <div>Error loading genres!</div>;
  }

  if (selectedGenre) {
    return (
      <GenreMangaList mangas={mangas} onBackToGenres={handleBackToGenres} />
    );
  }

  return (
    <Grid container spacing={2}>
      {GenreQuery.data?.map((genre, index) => (
        <Grid item key={index} xs={6} md={3} lg={2.3} xl={2}>
          <Button
            variant="outlined"
            onClick={() => setSelectedGenre(genre)}
            fullWidth
          >
            {genre}
          </Button>
        </Grid>
      ))}
    </Grid>
  );
};

export default GenreMenu;

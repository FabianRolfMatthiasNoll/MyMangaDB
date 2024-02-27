import React, { useState } from "react";
import { useQuery } from "react-query";
import { mangaAPI } from "../../api";
import { Manga } from "../../api/models";
import MangaList from "./AuthorMangaList";
import { Grid, Button } from "@mui/material";

const AuthorMenu: React.FC = () => {
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [mangas, setMangas] = useState<Manga[]>([]);

  const AuthorQuery = useQuery("GetAllAuthorNames", () =>
    mangaAPI.getAllAuthorNamesMangaAuthorsGet()
  );

  const handleBackToAuthors = () => {
    setSelectedAuthor(null);
  };

  const AuthorMangaQuery = useQuery(
    ["GetAllMangasByAuthor", selectedAuthor],
    () => {
      if (selectedAuthor === null) {
        return [];
      }
      return mangaAPI.getMangasByAuthorMangaAuthorAuthorNameGet({
        authorName: selectedAuthor,
      });
    },
    {
      onSuccess: (data) => setMangas(data),
    }
  );

  if (AuthorQuery.isLoading) {
    return <div>Loading authors...</div>;
  }

  if (AuthorQuery.isError) {
    console.error(AuthorQuery.error);
    return <div>Error loading authors!</div>;
  }

  if (selectedAuthor) {
    return <MangaList mangas={mangas} onBackToAuthors={handleBackToAuthors} />;
  }

  return (
    <Grid container spacing={2}>
      {AuthorQuery.data?.map((author, index) => (
        <Grid item key={index} xs={6} md={3} lg={2.3} xl={2}>
          <Button
            variant="outlined"
            onClick={() => setSelectedAuthor(author)}
            fullWidth
          >
            {author}
          </Button>
        </Grid>
      ))}
    </Grid>
  );
};

export default AuthorMenu;

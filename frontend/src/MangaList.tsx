import { useState, useEffect } from "react";
import { useQueries, useQuery } from "react-query";
import axios, { AxiosResponse } from "axios";
import Grid from "@mui/material/Grid";
import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import { manga } from "./api";
import { Manga } from "./api/models";

const MangaList: React.FC = () => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // TODO: Check for : in title an remove when searching for cover image

  const stationQuery = useQuery({
    queryKey: "GetAllMangas",
    queryFn: () => manga.getAllMangasMangaGet(),
    onSuccess: (data) => setMangas(data),
  });

  if (stationQuery.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Grid container spacing={1}>
      {mangas.map((manga, index) => (
        <Grid xs={6} md={4} lg={3}>
          <Card sx={{ maxWidth: 270 }}>
            <CardActionArea>
              <CardMedia
                component="img"
                height="400"
                image={`/static/images/${manga.title}_cover.jpg`}
                alt="mangacover"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {manga.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Authors:{" "}
                  {manga.authors
                    .map((author) => `${author.name} (${author.role})`)
                    .join(", ")}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default MangaList;

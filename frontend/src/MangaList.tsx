import { components, operations } from "./api-types";
import { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import Grid from "@mui/material/Grid";
import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import volumecover from "./static/images/volumecover.jpg";

type Manga = components["schemas"]["Manga"];
const API_URL = "http://localhost:8000";

const MangaList: React.FC = () => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAllMangas = async () => {
      try {
        const response = await axios.get<Manga[]>(`${API_URL}/manga/`);
        setMangas(response.data);
        console.log("Received mangas:", response.data);
      } catch (error) {
        console.error("Error fetching mangas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMangas();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Grid container spacing={1}>
      {mangas.map((manga, index) => (
        <Grid xs={3}>
          <Card sx={{ maxWidth: 270 }}>
            <CardActionArea>
              <CardMedia
                component="img"
                height="400"
                image={volumecover}
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

{
  /* <div>
      <h1>All Mangas</h1>
      {mangas.map((manga, index) => (
        <div key={index}>
          <h2>{manga.title}</h2>
          <p>Description: {manga.description}</p>
          <p>Total Volumes: {manga.total_volumes}</p>
          <p>Genres: {manga.genres.map((genre) => genre.name).join(", ")}</p>
          <p>
            Authors:{" "}
            {manga.authors
              .map((author) => `${author.name} (${author.role})`)
              .join(", ")}
          </p>
        </div>
      ))}
    </div> */
}

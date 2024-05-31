import React from "react";
import {
  List,
  ListItem,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Grid,
} from "@mui/material";
import { Manga } from "../api/models";
import MangaCard from "./MangaCard";
import { getMangaCoverImageUrl } from "../services/apiService";

interface MangaListProps {
  mangas: Manga[];
  isMobile: boolean;
}

const MangaList: React.FC<MangaListProps> = ({ mangas, isMobile }) => {
  return (
    <>
      {isMobile ? (
        <List>
          {mangas.map((manga) => (
            <ListItem key={manga.id}>
              <Card sx={{ width: "100%", display: "flex", height: "100px" }}>
                <CardMedia
                  component="img"
                  image={getMangaCoverImageUrl(manga.coverImage || "")}
                  alt="manga cover"
                  sx={{ width: "auto", height: "100px" }}
                />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    ml: 2,
                    overflow: "hidden",
                  }}
                >
                  <CardContent
                    sx={{
                      flex: "1 0 auto",
                      padding: "8px 0",
                      overflow: "hidden",
                    }}
                  >
                    <Typography variant="body1" noWrap>
                      {manga.title}
                    </Typography>
                    <Typography variant="body2" noWrap>
                      {manga.authors.map((author) => author.name).join(", ")}
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </ListItem>
          ))}
        </List>
      ) : (
        <Grid container spacing={2}>
          {mangas.map((manga) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={manga.id}>
              <MangaCard manga={manga} getImageUrl={getMangaCoverImageUrl} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

export default MangaList;

import React from "react";
import {
  List,
  ListItem,
  Card,
  CardMedia,
  Typography,
  Box,
  Grid,
  useTheme,
  alpha,
  Chip,
} from "@mui/material";
import { Manga } from "../api/models";
import MangaCard from "./MangaCard";
import { getMangaCoverImageUrl } from "../services/apiService";
import { Link } from "react-router-dom";

interface MangaListProps {
  mangas: Manga[];
  isMobile: boolean;
  listId?: number;
}

const MangaList: React.FC<MangaListProps> = ({ mangas, isMobile, listId }) => {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      "Not Started": theme.palette.error.main,
      "Reading": theme.palette.info.main,
      "Completed": theme.palette.success.main,
      "On Hold": theme.palette.warning.main,
      "Dropped": theme.palette.error.main,
      "Plan to Read": theme.palette.secondary.main,
      "Ongoing": theme.palette.info.main,
      "Hiatus": theme.palette.warning.main,
      "Discontinued": theme.palette.error.main,
    };
    return statusColors[status] || theme.palette.grey[500];
  };

  return (
    <>
      {isMobile ? (
        <List sx={{ p: 0 }}>
          {mangas.map((manga) => (
            <ListItem key={manga.id} sx={{ px: 0, py: 1 }}>
              <Card
                sx={{
                  width: "100%",
                  display: "flex",
                  height: 120,
                  borderRadius: 2,
                  overflow: "hidden",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[4],
                  },
                  textDecoration: "none",
                  "& *": {
                    textDecoration: "none",
                  },
                }}
                component={Link}
                to={`/manga/${manga.id}`}
                state={listId ? { from: 'list-detail', listId } : undefined}
              >
                <CardMedia
                  component="img"
                  image={getMangaCoverImageUrl(manga.coverImage || "")}
                  alt="manga cover"
                  sx={{
                    width: 80,
                    height: 120,
                    objectFit: "cover",
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    p: 1.5,
                    background: theme.palette.mode === "dark"
                      ? alpha(theme.palette.background.paper, 0.8)
                      : alpha(theme.palette.background.paper, 0.9),
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      color: theme.palette.text.primary,
                    }}
                  >
                    {manga.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {manga.authors.map((author) => author.name).join(", ")}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {manga.readingStatus && (
                      <Chip
                        label={manga.readingStatus}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(manga.readingStatus),
                          color: "white",
                          fontSize: "0.75rem",
                          height: 20,
                        }}
                      />
                    )}
                    {manga.overallStatus && (
                      <Chip
                        label={manga.overallStatus}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(manga.overallStatus),
                          color: "white",
                          fontSize: "0.75rem",
                          height: 20,
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Card>
            </ListItem>
          ))}
        </List>
      ) : (
        <Grid container spacing={2}>
          {mangas.map((manga) => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={manga.id}>
              <MangaCard 
                manga={manga} 
                getImageUrl={getMangaCoverImageUrl} 
                listId={listId}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

export default MangaList;

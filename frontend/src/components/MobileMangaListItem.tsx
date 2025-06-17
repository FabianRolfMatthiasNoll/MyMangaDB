import React, { useState, useEffect } from "react";
import {
  ListItem,
  Card,
  CardMedia,
  Typography,
  Box,
  useTheme,
  alpha,
  Chip,
} from "@mui/material";
import { Manga } from "../api/models";
import { Link } from "react-router-dom";
import { fetchMangaCoverImageAsBlobUrl } from "../services/imageService";

interface MobileMangaListItemProps {
  manga: Manga;
  listId?: number;
}

const MobileMangaListItem: React.FC<MobileMangaListItemProps> = ({ manga, listId }) => {
  const theme = useTheme();
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchImage = async () => {
      if (manga.coverImage) {
        const url = await fetchMangaCoverImageAsBlobUrl(manga.coverImage);
        if (isMounted) {
          setImageUrl(url);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [manga.coverImage]);
  
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
          image={imageUrl}
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
  );
};

export default MobileMangaListItem; 
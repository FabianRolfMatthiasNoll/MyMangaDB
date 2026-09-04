import React from "react";
import {
  ListItem,
  Card,
  CardMedia,
  Typography,
  Box,
  useTheme,
  alpha,
} from "@mui/material";
import { Manga } from "../api/models";
import { Link } from "react-router-dom";
import { getMangaCoverImageUrl } from "../services/imageService";
import MangaStatusChip from "./MangaStatusChip";

interface MobileMangaListItemProps {
  manga: Manga;
  listId?: number;
}

const MobileMangaListItem: React.FC<MobileMangaListItemProps> = ({
  manga,
  listId,
}) => {
  const theme = useTheme();

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
        state={listId ? { from: "list-detail", listId } : undefined}
      >
        <CardMedia
          component="img"
          image={
            manga.coverImage ? getMangaCoverImageUrl(manga.coverImage) : ""
          }
          alt="manga cover"
          loading="lazy"
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
            background:
              theme.palette.mode === "dark"
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
            <MangaStatusChip status={manga.readingStatus} />
            <MangaStatusChip status={manga.overallStatus} />
          </Box>
        </Box>
      </Card>
    </ListItem>
  );
};

export default MobileMangaListItem;

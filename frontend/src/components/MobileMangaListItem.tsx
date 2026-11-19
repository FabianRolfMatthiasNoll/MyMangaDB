import React, { useState, useEffect, useRef } from "react";
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
import { Manga, OwnershipStatus } from "../api/models";
import { Link } from "react-router-dom";
import { fetchMangaCoverImageAsBlobUrl } from "../services/imageService";
import { useStatusMeta } from "../hooks/useStatusMeta";
import { useOwnershipStatus } from "../hooks/useOwnershipStatus";

interface MobileMangaListItemProps {
  manga: Manga;
  listId?: number;
}

const MobileMangaListItem: React.FC<MobileMangaListItemProps> = ({ manga, listId }) => {
  const theme = useTheme();
  const { getStatusLabel, getStatusColor } = useStatusMeta();
  const { getOwnershipLabel, getOwnershipColor } = useOwnershipStatus();
  const [imageUrl, setImageUrl] = useState("");
  const imageUrlRef = useRef("");

  // A title that is only wanted is drawn differently, so it is never
  // mistaken for one that is already on the shelf.
  const isWishlist = manga.ownershipStatus === OwnershipStatus.Wishlist;

  useEffect(() => {
    if (!manga.coverImage) {
      return;
    }

    let isMounted = true;
    const fetchImage = async () => {
      const url = await fetchMangaCoverImageAsBlobUrl(manga.coverImage!);
      if (!isMounted) {
        // The effect was cleaned up while the request was in flight - release
        // the blob URL we just created instead of leaking it.
        if (url) {
          URL.revokeObjectURL(url);
        }
        return;
      }
      imageUrlRef.current = url;
      setImageUrl(url);
    };

    fetchImage();

    return () => {
      isMounted = false;
      // Revoke the URL that was actually created. Reading it from the state
      // here would use the value from the render the effect started in, which
      // is stale and leaves the blob URL alive.
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
        imageUrlRef.current = "";
      }
    };
  }, [manga.coverImage]);

  return (
    <ListItem key={manga.id} sx={{ px: 0, py: 1 }}>
      <Card
        sx={{
          width: "100%",
          display: "flex",
          height: 120,
          borderRadius: 2,
          overflow: "hidden",
          border: isWishlist
            ? `2px dashed ${theme.palette.secondary.main}`
            : "2px solid transparent",
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
            {manga.ownershipStatus === OwnershipStatus.Wishlist && (
              <Chip
                label={getOwnershipLabel(manga.ownershipStatus)}
                size="small"
                sx={{
                  bgcolor: getOwnershipColor(manga.ownershipStatus),
                  color: "white",
                  fontSize: "0.75rem",
                  height: 20,
                }}
              />
            )}
            {manga.readingStatus && (
              <Chip
                label={getStatusLabel(manga.readingStatus)}
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
                label={getStatusLabel(manga.overallStatus)}
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

import React from "react";
import {
  Card,
  CardMedia,
  Typography,
  Box,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import { Manga, OwnershipStatus } from "../api/models";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getMangaCoverImageUrl } from "../services/imageService";
import { useStatusMeta } from "../hooks/useStatusMeta";
import { useOwnershipStatus } from "../hooks/useOwnershipStatus";

interface MangaCardProps {
  manga: Manga;
  listId?: number;
}

const MangaCard: React.FC<MangaCardProps> = ({ manga, listId }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { getStatusLabel, getStatusColor } = useStatusMeta();
  const { getOwnershipLabel, getOwnershipColor } = useOwnershipStatus();
  const imageUrl = manga.coverImage
    ? getMangaCoverImageUrl(manga.coverImage)
    : "";

  // A title that is only wanted is drawn differently, so it is never
  // mistaken for one that is already on the shelf.
  const isWishlist = manga.ownershipStatus === OwnershipStatus.Wishlist;

  const cardStyles = {
    // The grid already sizes the card. A fixed maximum width would leave
    // a ragged edge in the wider cells.
    width: "100%",
    position: "relative",
    // The card is a link, and a link is inline by default. The line box
    // around it then adds a strip of empty space above and below the cover.
    display: "block",
    borderRadius: 2,
    overflow: "hidden",
    border: isWishlist
      ? `2px dashed ${theme.palette.secondary.main}`
      : "2px solid transparent",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: theme.shadows[8],
      "& .cover": {
        opacity: 1,
      },
    },
  };

  const coverStyles = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    transition: "opacity 0.3s ease",
    background: `linear-gradient(to bottom,
      ${alpha(theme.palette.background.paper, 0)} 0%,
      ${alpha(theme.palette.background.paper, 0.8)} 50%,
      ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
  };

  const cardMediaWrapperStyle = {
    paddingTop: "150%",
    position: "relative",
    width: "100%",
    overflow: "hidden",
  };

  const cardMediaStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  return (
    <Card
      sx={cardStyles}
      component={Link}
      to={`/manga/${manga.id}`}
      state={listId ? { from: "list-detail", listId } : undefined}
    >
      <Box sx={cardMediaWrapperStyle}>
        {manga.coverImage ? (
          <CardMedia
            component="img"
            image={imageUrl}
            alt={manga.title}
            loading="lazy"
            sx={cardMediaStyle}
          />
        ) : (
          // A title without a cover would otherwise show the browser's
          // broken image icon.
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: 2,
              textAlign: "center",
              bgcolor: alpha(theme.palette.action.disabledBackground, 0.3),
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("common.noCoverImage")}
            </Typography>
          </Box>
        )}
        <Box className="cover" sx={coverStyles}>
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {manga.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
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
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
              {manga.lists &&
                manga.lists.slice(0, 4).map((list) => (
                  <Chip
                    key={list.id}
                    label={
                      list.name.length > 13
                        ? list.name.substring(0, 13) + "..."
                        : list.name
                    }
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: "0.7rem",
                      height: 20,
                      borderColor: theme.palette.divider,
                      color: theme.palette.text.secondary,
                    }}
                  />
                ))}
              {manga.lists && manga.lists.length > 4 && (
                <Chip
                  label={`+${manga.lists.length - 4}`}
                  size="small"
                  sx={{
                    fontSize: "0.7rem",
                    height: 20,
                    borderRadius: "50%",
                    minWidth: 20,
                    px: 0,
                    bgcolor: theme.palette.action.selected,
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default MangaCard;

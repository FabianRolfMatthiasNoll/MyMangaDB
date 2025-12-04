import React from "react";
import {
  Card,
  CardMedia,
  Typography,
  Box,
  CardActionArea,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import { Manga } from "../api/models";
import { Link } from "react-router-dom";
import { getMangaCoverImageUrl } from "../services/imageService";

interface MangaCardProps {
  manga: Manga;
  listId?: number;
}

const MangaCard: React.FC<MangaCardProps> = ({ manga, listId }) => {
  const theme = useTheme();
  const imageUrl = manga.coverImage
    ? getMangaCoverImageUrl(manga.coverImage)
    : "";

  const cardStyles = {
    maxWidth: 350,
    position: "relative",
    borderRadius: 2,
    overflow: "hidden",
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

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      "Not Started": theme.palette.error.main,
      Reading: theme.palette.info.main,
      Completed: theme.palette.success.main,
      "On Hold": theme.palette.warning.main,
      Dropped: theme.palette.error.main,
      "Plan to Read": theme.palette.secondary.main,
      Ongoing: theme.palette.info.main,
      Hiatus: theme.palette.warning.main,
      Discontinued: theme.palette.error.main,
    };
    return statusColors[status] || theme.palette.grey[500];
  };

  return (
    <Card
      sx={cardStyles}
      component={Link}
      to={`/manga/${manga.id}`}
      state={listId ? { from: "list-detail", listId } : undefined}
    >
      <CardActionArea>
        <Box sx={cardMediaWrapperStyle}>
          <CardMedia
            component="img"
            image={imageUrl}
            alt="manga cover"
            sx={cardMediaStyle}
          />
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
              <Box
                sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}
              >
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
      </CardActionArea>
    </Card>
  );
};

export default MangaCard;

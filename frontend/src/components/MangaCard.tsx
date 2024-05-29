import React from "react";
import {
  Card,
  CardMedia,
  Typography,
  Box,
  CardActionArea,
} from "@mui/material";
import { Manga } from "../api/models";

interface MangaCardProps {
  manga: Manga;
  getImageUrl: (filename: string) => string;
}

const MangaCard: React.FC<MangaCardProps> = ({ manga, getImageUrl }) => {
  const cardStyles = {
    maxWidth: 350,
    margin: 0,
    padding: 0,
    position: "relative",
    "&:hover": {
      "& .MuiCardMedia-root": {
        transform: "scale(1.05)",
      },
      "& .textOverlay": {
        display: "none",
      },
    },
  };

  const textOverlayStyles = {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    color: "white",
    padding: "20px",
    background:
      "linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.7) 90%, rgba(0,0,0,0) 100%)",
  };

  const cardMediaWrapperStyle = {
    paddingTop: "150%",
    position: "relative",
    width: "100%",
  };

  const cardMediaStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  };

  return (
    <Card sx={cardStyles}>
      <CardActionArea>
        <Box sx={cardMediaWrapperStyle}>
          <CardMedia
            component="img"
            image={getImageUrl(manga.coverImage || "")}
            alt="manga cover"
            sx={cardMediaStyle}
          />
        </Box>
        <Box sx={textOverlayStyles} className="textOverlay">
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            sx={{
              fontSize: {
                xs: "1rem",
                sm: "1.25rem",
                md: "1.5rem",
              },
            }}
          >
            {manga.title}
          </Typography>
          {manga.authors.map((author) => author.name).join(", ")}
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default MangaCard;

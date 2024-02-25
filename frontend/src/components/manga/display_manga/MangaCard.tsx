import {
  Card,
  CardActionArea,
  CardMedia,
  Typography,
  Box,
} from "@mui/material";
import { Manga, Author } from "../../../api/models";
import { useState } from "react";
import MangaModal from "./MangaModal";
import defaultCover from "./default-cover.jpg";

interface Props {
  manga: Manga;
}

export default function MangaCard({ manga }: Props) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Custom styles for the hover effect and text overlay
  const cardStyles = {
    maxWidth: 350,
    margin: 0,
    padding: 0,
    position: "relative",
    "&:hover": {
      "& .MuiCardMedia-root": {
        transform: "scale(1.05)", // Enlarge image on hover
      },
      "& .textOverlay": {
        display: "none", // Hide text on hover
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
    paddingTop: "150%", // Manga Cover Aspect Ratio
    position: "relative",
    width: "100%",
  };

  const cardMediaStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover", // Adjust as needed to 'contain' or 'cover' based on desired appearance
    transition: "transform 0.3s ease", // Smooth transition for hover effect
  };

  return (
    <>
      <Card sx={cardStyles} onClick={handleClick}>
        <CardActionArea>
          <Box sx={cardMediaWrapperStyle}>
            <CardMedia
              component="img"
              image={
                manga.coverImage
                  ? `data:image/jpeg;base64,${manga.coverImage}`
                  : defaultCover
              }
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
            <Typography
              variant="body2"
              sx={{
                fontSize: {
                  xs: "0.75rem",
                  sm: "0.875rem",
                  md: "1rem",
                },
              }}
            >
              Authors:{" "}
              {manga.authors.map((author: Author) => author.name).join(", ")}
            </Typography>
          </Box>
        </CardActionArea>
      </Card>
      <MangaModal manga={manga} open={open} onClose={handleClose} />
    </>
  );
}

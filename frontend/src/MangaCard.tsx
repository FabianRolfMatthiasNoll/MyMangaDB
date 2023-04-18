import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import { Manga } from "./api/models";
import { useState } from "react";
import MangaModal from "./MangaModal";

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

  const imageUrl = `/static/images/${manga.title.replace(":", "")}_cover.jpg`;

  return (
    <>
      <Card sx={{ maxWidth: 270 }} onClick={handleClick}>
        <CardActionArea>
          <CardMedia
            component="img"
            height="400"
            image={imageUrl}
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
      <MangaModal manga={manga} open={open} onClose={handleClose} />
    </>
  );
}

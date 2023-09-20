import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import { Manga, Author } from "../../../api/models";
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

  return (
    <>
      <Card sx={{ maxWidth: 350, minHeight: 500 }} onClick={handleClick}>
        <CardActionArea>
          <CardMedia
            component="img"
            height="350"
            width={(350 * 2) / 3}
            image={`data:image/jpeg;base64,${manga.coverImage}`}
            alt="mangacover"
            sx={{ objectFit: "contain" }}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {manga.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Authors:{" "}
              {manga.authors
                .map((author: Author) => `${author.name}`)
                .join(", ")}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
      <MangaModal manga={manga} open={open} onClose={handleClose} />
    </>
  );
}

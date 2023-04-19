import { Box, Button, Modal, Typography } from "@mui/material";
import { Manga } from "../../api/models";
import { useState } from "react";
import { Button, Modal } from "@mui/material";
import { Manga, Author, Genre } from "../../api/models";

interface Props {
  manga: Manga;
  open: boolean;
  onClose: () => void;
}

export default function MangaModal({ manga, open, onClose }: Props) {
  const imageUrl = `/static/images/${manga.title.replace(":", "")}_cover.jpg`;
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="manga-modal-title"
      aria-describedby="manga-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img src={imageUrl} alt="mangacover" />
          <Box sx={{ ml: 5 }}>
            <Typography
              id="manga-modal-title"
              variant="h2"
              component="h2"
              gutterBottom
            >
              {manga.title}
            </Typography>
            <Typography component="p" mb={1}>
              <strong>Authors:</strong>{" "}
              {manga.authors
                .map((author) => `${author.name} (${author.role})`)
                .join(", ")}
            </Typography>
            <Typography component="p" mb={1}>
              <strong>Genres:</strong>{" "}
              {manga.genres.map((genre) => genre.name).join(", ")}
            </Typography>
            <Typography
              id="manga-modal-description"
              component="p"
              mt={1}
              sx={{
                whiteSpace: "pre-line",
              }}
            >
              <strong>Description:</strong>
              {"\n"} {manga.description}
            </Typography>
          </Box>
        </Box>
              {manga.genres.map((genre: Genre) => genre.name).join(", ")}
            </p>
            <p>{manga.description}</p>
          </div>
        </div>
      </div>
      </Box>
    </Modal>
  );
}

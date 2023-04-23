import { Box, Button, Modal, Paper, Typography } from "@mui/material";
import { Manga } from "../../../api/models";
import { useState } from "react";
import VolumesModal from "./VolumeModal";

interface Props {
  manga: Manga;
  open: boolean;
  onClose: () => void;
}

export default function MangaModal({ manga, open, onClose }: Props) {
  const imageUrl = `/static/images/${manga.title.replace(":", "")}_cover.jpg`;
  const [volumesOpen, setVolumesOpen] = useState(false);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="manga-modal-title"
      aria-describedby="manga-modal-description"
    >
      <Paper
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 5,
          overflow: "auto",
          maxWidth: "95vw", // or any other value
          maxHeight: "95vh", // or any other value
          width: "90vw",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 5,
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
        <Button onClick={() => setVolumesOpen(true)}>Volumes</Button>
        {volumesOpen && (
          <VolumesModal manga={manga} onClose={() => setVolumesOpen(false)} />
        )}
      </Paper>
    </Modal>
  );
}

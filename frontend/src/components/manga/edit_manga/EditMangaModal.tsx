import {
  Autocomplete,
  Box,
  Button,
  Modal,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Manga } from "../../../api/models";
import { useState } from "react";

interface Props {
  manga: Manga;
  onClose: () => void;
}

export default function EditMangaModal({ manga, onClose }: Props) {
  const [updatedManga, setUpdatedManga] = useState<Manga>(manga);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedManga({
      ...updatedManga,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <Modal
      open={true}
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
          <TextField
            fullWidth
            margin="normal"
            name="title"
            label="Title"
            value={updatedManga.title}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="description"
            label="Description"
            value={updatedManga.description}
            onChange={handleInputChange}
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            margin="normal"
            name="totalVolumes"
            label="Total Volumes"
            value={updatedManga.totalVolumes}
            onChange={handleInputChange}
            type="number"
          />
          <TextField
            fullWidth
            margin="normal"
            name="coverImage"
            label="Cover Image URL"
            value={updatedManga.coverImage}
            onChange={handleInputChange}
          />
        </Box>
      </Paper>
    </Modal>
  );
}

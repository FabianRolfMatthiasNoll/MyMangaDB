import {
  Box,
  Button,
  IconButton,
  Modal,
  Paper,
  Typography,
} from "@mui/material";
import { Manga } from "../../../api/models";
import { useState } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { mangaAPI } from "../../../api";
import { useMutation, useQueryClient } from "react-query";

interface Props {
  open: boolean;
  onClose: () => void;
  mangaList: Manga[];
  currentIndex: number;
}

export default function MangaModalMAL({
  mangaList,
  open,
  currentIndex,
  onClose,
}: Props) {
  const [index, setIndex] = useState(currentIndex);
  const imageUrl = `data:image/jpeg;base64,${mangaList[index].coverImage}`;

  const handleNext = () => {
    if (index < mangaList.length - 1) {
      setIndex(index + 1);
    }
  };

  const handlePrevious = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  const handleSelectClick = async () => {
    mutation.mutate(mangaList[index]);
    onClose();
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (manga: Manga) =>
      mangaAPI.createMangaMangaPost({ manga: manga }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["GetAllMangas"] });
    },
  });

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
          <IconButton onClick={handlePrevious} disabled={index === 0}>
            <ArrowBackIosIcon />
          </IconButton>
          <img src={imageUrl} alt="mangacover" />
          <Box sx={{ ml: 5 }}>
            <Typography
              id="manga-modal-title"
              variant="h2"
              component="h2"
              gutterBottom
            >
              {mangaList[index].title}
            </Typography>
            <Typography component="p" mb={1}>
              <strong>Authors:</strong>{" "}
              {mangaList[index].authors
                .map((author) => `${author.name} (${author.role})`)
                .join(", ")}
            </Typography>
            <Typography component="p" mb={1}>
              <strong>Genres:</strong>{" "}
              {mangaList[index].genres.map((genre) => genre.name).join(", ")}
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
              {"\n"} {mangaList[index].description}
            </Typography>
          </Box>
          <IconButton
            onClick={handleNext}
            disabled={index === mangaList.length - 1}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
        <Button onClick={handleSelectClick}>Submit</Button>
      </Paper>
    </Modal>
  );
}

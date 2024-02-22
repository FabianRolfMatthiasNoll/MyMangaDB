import {
  Box,
  Button,
  Modal,
  Paper,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Manga } from "../../../api/models";
import { mangaAPI } from "../../../api";
import { useState } from "react";
import VolumesModal from "./VolumeModal";
import { useQueryClient } from "react-query";
import EditMangaModal from "../edit_manga/EditMangaModal";
import { useAuth } from '../../../AuthContext';

interface Props {
  manga: Manga;
  open: boolean;
  onClose: () => void;
}

const paperStyles = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 5,
  overflow: "auto",
  maxWidth: "95vw",
  maxHeight: "95vh",
  width: "90vw",
};

const centerBoxStyles = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  mb: 5,
};

export default function MangaModal({ manga, open, onClose }: Props) {
  const imageUrl = `data:image/jpeg;base64,${manga.coverImage}`;
  const [modalStates, setModalStates] = useState({
    volumesOpen: false,
    editOpen: false,
    deleteOpen: false,
  });
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      await mangaAPI.removeMangaMangaRemoveDelete({ mangaId: manga.id });
      onClose();
      queryClient.invalidateQueries({ queryKey: ["GetAllMangas"] });
    } catch (error) {
      console.error("Error deleting manga:", error);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="manga-modal-title"
      aria-describedby="manga-modal-description"
    >
      <>
        <Paper sx={paperStyles}>
          <Box
            sx={{
              position: "absolute",
              top: 20,
              right: 20,
              transform: "scale(2)",
            }}
          >
            {isLoggedIn &&  <IconButton
              aria-label="delete"
              onClick={() =>
                setModalStates((prev) => ({ ...prev, deleteOpen: true }))
              }
            >
              <DeleteIcon />
            </IconButton>}
           
          </Box>
          <Box sx={centerBoxStyles}>
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
                  .map((author) => `${author.name}`)
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
                sx={{ whiteSpace: "pre-line" }}
              >
                <strong>Description:</strong>
                {"\n"} {manga.description}
              </Typography>
            </Box>
          </Box>
          <Button
            onClick={() =>
              setModalStates((prev) => ({ ...prev, volumesOpen: true }))
            }
          >
            Volumes
          </Button>
          {modalStates.volumesOpen && (
            <VolumesModal
              manga={manga}
              onClose={() =>
                setModalStates((prev) => ({ ...prev, volumesOpen: false }))
              }
            />
          )}
          {isLoggedIn && <Button
            onClick={() =>
              setModalStates((prev) => ({ ...prev, editOpen: true }))
            }
          >
            Edit
          </Button>}
          
          {modalStates.editOpen && (
            <EditMangaModal
              manga={manga}
              onClose={() =>
                setModalStates((prev) => ({ ...prev, editOpen: false }))
              }
            />
          )}
        </Paper>
        <Dialog
          open={modalStates.deleteOpen}
          onClose={() =>
            setModalStates((prev) => ({ ...prev, deleteOpen: false }))
          }
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Delete Manga"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this manga? This action cannot be
              undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setModalStates((prev) => ({ ...prev, deleteOpen: false }))
              }
              color="primary"
            >
              Cancel
            </Button>
            <Button onClick={handleDelete} color="primary" autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </Modal>
  );
}

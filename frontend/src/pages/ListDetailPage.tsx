import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Paper,
  Container,
  useTheme,
  useMediaQuery,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getListById, updateList, deleteList } from "../services/listService";
import { Manga, ListModel } from "../api/models";
import { getMangasByListId } from "../services/mangaService";
import MangaList from "../components/MangaList";
import { useUser } from "../context/UserContext";

const ListDetailPage: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [list, setList] = useState<ListModel | null>(null);
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [listName, setListName] = useState("");

  useEffect(() => {
    const fetchListData = async () => {
      try {
        setLoading(true);
        if (listId) {
          const listResponse = await getListById(Number(listId));
          setList(listResponse);
          const mangasResponse = await getMangasByListId(Number(listId));
          setMangas(mangasResponse);
        }
      } catch (error) {
        console.error("Error fetching list data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListData();
  }, [listId]);

  const handleOpenDialog = () => {
    if (list) {
      setListName(list.name);
      setDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setListName("");
  };

  const handleSaveList = async () => {
    if (list && listName) {
      try {
        await updateList(list.id, listName);
        setList({ ...list, name: listName });
        handleCloseDialog();
      } catch (error) {
        console.error("Error updating list:", error);
      }
    }
  };

  const handleDeleteList = async () => {
    if (list && window.confirm("Are you sure you want to delete this list?")) {
      try {
        await deleteList(list.id);
        navigate("/lists");
      } catch (error) {
        console.error("Error deleting list:", error);
      }
    }
  };

  const handleBack = () => {
    navigate("/lists");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!list) {
    return (
      <Container maxWidth="lg">
        <Box p={3}>
          <Typography variant="h5">List not found</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box p={isMobile ? 2 : 3}>
        <Paper
          elevation={0}
          sx={{
            p: isMobile ? 2 : 3,
            mb: 4,
            backgroundColor: "transparent",
            borderRadius: 2,
          }}
        >
          <Box display="flex" alignItems="center" mb={3}>
            <IconButton
              onClick={handleBack}
              sx={{
                mr: 2,
                backgroundColor: "background.paper",
                "&:hover": { backgroundColor: "action.hover" },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: "bold",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flexGrow: 1,
              }}
            >
              {list.name}
            </Typography>
            {isAdmin && (
              <Box ml={2} display="flex">
                <Tooltip title="Edit List">
                  <IconButton
                    onClick={handleOpenDialog}
                    sx={{
                      mr: 1,
                      backgroundColor: "background.paper",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete List">
                  <IconButton
                    onClick={handleDeleteList}
                    sx={{
                      backgroundColor: "background.paper",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          {mangas.length === 0 ? (
            <Box
              textAlign="center"
              py={8}
              sx={{
                backgroundColor: "background.paper",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No mangas in this list yet
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Add mangas to this list from the manga details page
              </Typography>
            </Box>
          ) : (
            <MangaList
              mangas={mangas}
              isMobile={isMobile}
              listId={Number(listId)}
            />
          )}
        </Paper>

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          PaperProps={{
            sx: {
              borderRadius: 2,
              minWidth: isMobile ? "90%" : "400px",
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>Edit List</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="List Name"
              type="text"
              fullWidth
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{
                textTransform: "none",
                px: 2,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveList}
              color="primary"
              variant="contained"
              sx={{
                textTransform: "none",
                px: 3,
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ListDetailPage;

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Paper,
  Grid,
  Container,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { getListWithCount, createList, updateList, deleteList, ListWithCount } from "../services/listService";
import { useUser } from "../context/UserContext";

const ListsPage: React.FC = () => {
  const [lists, setLists] = useState<ListWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [listName, setListName] = useState("");
  const [editingList, setEditingList] = useState<{ id: number; name: string } | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAdmin } = useUser();

  const fetchLists = async () => {
    try {
      setLoading(true);
      const response = await getListWithCount();
      setLists(response);
    } catch (error) {
      console.error("Error fetching lists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleOpenDialog = (list?: { id: number; name: string }) => {
    if (list) {
      setEditingList(list);
      setListName(list.name);
    } else {
      setEditingList(null);
      setListName("");
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingList(null);
    setListName("");
  };

  const handleSaveList = async () => {
    try {
      if (editingList) {
        await updateList(editingList.id, listName);
      } else {
        await createList(listName);
      }
      handleCloseDialog();
      fetchLists();
    } catch (error) {
      console.error("Error saving list:", error);
    }
  };

  const handleDeleteList = async (listId: number) => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      try {
        await deleteList(listId);
        fetchLists();
      } catch (error) {
        console.error("Error deleting list:", error);
      }
    }
  };

  const handleListClick = (listId: number) => {
    navigate(`/lists/${listId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box p={isMobile ? 2 : 3}>
        <Paper elevation={0} sx={{ p: isMobile ? 2 : 3, mb: 4, backgroundColor: 'transparent' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 'bold' }}>
              My Lists
            </Typography>
            {isAdmin && lists.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  px: isMobile ? 2 : 3,
                  py: isMobile ? 0.5 : 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }}
              >
                Create New List
              </Button>
            )}
          </Box>

          {lists.length === 0 ? (
            <Box
              textAlign="center"
              py={8}
              sx={{
                backgroundColor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No lists yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Create your first list to start organizing your manga collection
              </Typography>
              {isAdmin && (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  sx={{
                    px: isMobile ? 3 : 4,
                    py: isMobile ? 1 : 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: isMobile ? '1rem' : '1.1rem'
                  }}
                >
                  Create Your First List
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={isMobile ? 2 : 3}>
              {lists.map((list) => (
                <Grid item xs={12} sm={6} md={4} key={list.id}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: isMobile ? 2 : 3,
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4
                      }
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      onClick={() => handleListClick(list.id)}
                    >
                      <Box>
                        <Typography
                          variant={isMobile ? "subtitle1" : "h6"}
                          sx={{
                            fontWeight: 'bold',
                            mb: 1
                          }}
                        >
                          {list.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          {list.mangaCount} manga{list.mangaCount !== 1 ? "s" : ""}
                        </Typography>
                      </Box>
                      {isAdmin && (
                        <Box>
                          <Tooltip title="Edit List">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDialog(list);
                              }}
                              sx={{
                                backgroundColor: 'background.paper',
                                '&:hover': { backgroundColor: 'action.hover' }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete List">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteList(list.id);
                              }}
                              sx={{
                                backgroundColor: 'background.paper',
                                '&:hover': { backgroundColor: 'action.hover' }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          PaperProps={{
            sx: {
              borderRadius: 2,
              minWidth: isMobile ? '90%' : '400px'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            {editingList ? "Edit List" : "Create New List"}
          </DialogTitle>
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
                textTransform: 'none',
                px: 2
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveList}
              color="primary"
              variant="contained"
              sx={{
                textTransform: 'none',
                px: 3
              }}
            >
              {editingList ? "Save" : "Create"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ListsPage;

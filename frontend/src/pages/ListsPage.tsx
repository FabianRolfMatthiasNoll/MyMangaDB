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
import {
  getListWithCount,
  createList,
  updateList,
  deleteList,
  ListWithCount,
} from "../services/listService";
import { useUser } from "../context/UserContext";
import { useTranslation } from "react-i18next";
import { invalidateMangaQueries } from "../services/queryInvalidation";
import { useQueryClient } from "@tanstack/react-query";

const ListsPage: React.FC = () => {
  const { t } = useTranslation();
  const [lists, setLists] = useState<ListWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [listName, setListName] = useState("");
  const [editingList, setEditingList] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [listToDelete, setListToDelete] = useState<ListWithCount | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { isAdmin } = useUser();
  const queryClient = useQueryClient();

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
    setSaving(true);
    try {
      // A failed request resolves to null. Closing the dialog then would
      // throw the typed name away without telling the user.
      const saved = editingList
        ? await updateList(editingList.id, listName)
        : await createList(listName);

      if (!saved) {
        return;
      }

      handleCloseDialog();
      await invalidateMangaQueries(queryClient);
      fetchLists();
    } catch (error) {
      console.error("Error saving list:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteList = async () => {
    if (!listToDelete) {
      return;
    }

    try {
      const deleted = await deleteList(listToDelete.id);
      if (!deleted) {
        return;
      }
      setListToDelete(null);
      await invalidateMangaQueries(queryClient);
      fetchLists();
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  const handleListClick = (listId: number) => {
    navigate(`/lists/${listId}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Paper
          elevation={0}
          sx={{ p: isMobile ? 2 : 3, mb: 4, backgroundColor: "transparent" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{ fontWeight: "bold" }}
            >
              {t("lists.myLists")}
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
                  textTransform: "none",
                  fontSize: isMobile ? "0.875rem" : "1rem",
                }}
              >
                {t("lists.createNewList")}
              </Button>
            )}
          </Box>

          {lists.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                backgroundColor: "background.paper",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t("lists.noListsYet")}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {t("lists.createFirstList")}
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
                    textTransform: "none",
                    fontSize: isMobile ? "1rem" : "1.1rem",
                  }}
                >
                  {t("lists.createYourFirstList")}
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={isMobile ? 2 : 3}>
              {lists.map((list) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={list.id}>
                  <Paper
                    elevation={2}
                    onClick={() => handleListClick(list.id)}
                    sx={{
                      p: isMobile ? 2 : 3,
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography
                          variant={isMobile ? "subtitle1" : "h6"}
                          sx={{
                            fontWeight: "bold",
                            mb: 1,
                          }}
                        >
                          {list.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          {t("lists.mangaCount", { count: list.mangaCount })}
                        </Typography>
                      </Box>
                      {isAdmin && (
                        <Box>
                          <Tooltip title={t("common.edit")}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDialog(list);
                              }}
                              sx={{
                                backgroundColor: "background.paper",
                                "&:hover": { backgroundColor: "action.hover" },
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t("common.delete")}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setListToDelete(list);
                              }}
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
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 2,
                minWidth: isMobile ? "90%" : "400px",
              },
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            {editingList ? t("lists.editList") : t("lists.createNewList")}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label={t("lists.listName")}
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
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSaveList}
              color="primary"
              variant="contained"
              disabled={saving}
              sx={{
                textTransform: "none",
                px: 3,
              }}
            >
              {saving
                ? t("common.saving")
                : editingList
                  ? t("common.save")
                  : t("common.create")}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={listToDelete !== null}
          onClose={() => setListToDelete(null)}
        >
          <DialogTitle>{t("lists.deleteList")}</DialogTitle>
          <DialogContent>
            <Typography>
              {t("lists.deleteListConfirm", { name: listToDelete?.name })}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setListToDelete(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleDeleteList}
              color="error"
              variant="contained"
            >
              {t("common.delete")}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ListsPage;

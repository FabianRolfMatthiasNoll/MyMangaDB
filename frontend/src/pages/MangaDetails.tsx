import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Container,
  Grid,
  Box,
  Typography,
  Chip,
  Rating,
  Button,
  Paper,
  Divider,
  IconButton,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getMangaCoverImageUrl } from "../services/imageService";
import { getMangaDetails, updateMangaDetails, deleteManga } from "../services/mangaService";
import { Manga } from "../api/models";
import MangaForm from "../components/MangaForm";

const MangaDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const [manga, setManga] = useState<Manga | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchManga = async () => {
      if (id) {
        const mangaData = await getMangaDetails(Number(id));
        setManga(mangaData);
      }
    };

    fetchManga();
  }, [id]);

  if (!manga) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleBackClick = () => {
    if (location.state?.from === 'list-detail' && location.state?.listId) {
      navigate(`/lists/${location.state.listId}`);
    } else {
      navigate("/");
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (id) {
      try {
        await deleteManga(Number(id));
        navigate("/");
      } catch (error) {
        console.error("Failed to delete manga:", error);
      }
    }
    setDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleSave = async (updatedManga: Manga, coverImage?: File) => {
    try {
      const savedManga = await updateMangaDetails(updatedManga, coverImage);
      setManga(savedManga);
      setEditMode(false);
      setNotification({
        open: true,
        message: 'Manga updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error("Failed to update manga:", error);
      setNotification({
        open: true,
        message: 'Failed to update manga',
        severity: 'error'
      });
    }
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      "Not Started": theme.palette.error.main,
      "Reading": theme.palette.info.main,
      "Completed": theme.palette.success.main,
      "On Hold": theme.palette.warning.main,
      "Dropped": theme.palette.error.main,
      "Plan to Read": theme.palette.secondary.main,
      "Ongoing": theme.palette.info.main,
      "Hiatus": theme.palette.warning.main,
      "Discontinued": theme.palette.error.main,
    };
    return statusColors[status] || theme.palette.grey[500];
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
        >
          {location.state?.from === 'list-detail' ? 'Back to List' : 'Back to Dashboard'}
        </Button>
        <Box>
          <IconButton onClick={handleToggleEditMode} sx={{ mr: 1 }}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={handleDeleteClick} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Manga</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{manga.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {editMode ? (
        <MangaForm
          manga={manga}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <Grid container spacing={3}>
          {/* Cover Image Section */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                height: "fit-content",
                background: theme.palette.mode === "dark" 
                  ? alpha(theme.palette.background.paper, 0.8)
                  : alpha(theme.palette.background.paper, 0.9),
              }}
            >
              {manga.coverImage ? (
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    paddingTop: "150%", // Fixed aspect ratio
                  }}
                >
                  <img
                    src={getMangaCoverImageUrl(manga.coverImage)}
                    alt={manga.title}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "scale-down", // This will fill the container and crop if necessary
                    }}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    paddingTop: "140%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: theme.palette.mode === "dark" 
                      ? alpha(theme.palette.grey[900], 0.8)
                      : alpha(theme.palette.grey[200], 0.8),
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    No Cover Image
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Details Section */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                height: "fit-content",
                display: "flex",
                flexDirection: "column",
                background: theme.palette.mode === "dark" 
                  ? alpha(theme.palette.background.paper, 0.8)
                  : alpha(theme.palette.background.paper, 0.9),
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {manga.title}
                  </Typography>
                  {manga.japaneseTitle && (
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      {manga.japaneseTitle}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Status Badges */}
              <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
                {manga.readingStatus && (
                  <Chip
                    label={`Reading: ${manga.readingStatus}`}
                    sx={{
                      bgcolor: getStatusColor(manga.readingStatus),
                      color: "white",
                      fontWeight: 500,
                    }}
                  />
                )}
                {manga.overallStatus && (
                  <Chip
                    label={`Collection: ${manga.overallStatus}`}
                    sx={{
                      bgcolor: getStatusColor(manga.overallStatus),
                      color: "white",
                      fontWeight: 500,
                    }}
                  />
                )}
                {manga.category && (
                  <Chip
                    label={manga.category}
                    sx={{
                      bgcolor: theme.palette.mode === "dark" 
                        ? alpha(theme.palette.primary.main, 0.9)
                        : theme.palette.primary.main,
                      color: "white",
                      fontWeight: 500,
                    }}
                  />
                )}
              </Box>

              {/* Authors and Genres */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Authors
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {manga.authors.map((author) => (
                    <Chip
                      key={author.id}
                      label={author.name}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Genres
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {manga.genres.map((genre) => (
                    <Chip
                      key={genre.id}
                      label={genre.name}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Summary */}
              {manga.summary && (
                <Box sx={{ mb: 3, flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Summary
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {manga.summary}
                  </Typography>
                </Box>
              )}

              {/* Additional Details */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Language
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {manga.language || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Rating
                  </Typography>
                  <Rating
                    value={manga.starRating || 0}
                    precision={0.5}
                    readOnly
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
              </Grid>

              {/* Lists */}
              {manga.lists.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Lists
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {manga.lists.map((list) => (
                      <Chip
                        key={list.id}
                        label={list.name}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Volumes Section */}
          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                background: theme.palette.mode === "dark" 
                  ? alpha(theme.palette.background.paper, 0.8)
                  : alpha(theme.palette.background.paper, 0.9),
              }}
            >
              <Typography variant="h6" gutterBottom>
                Volumes
              </Typography>
              {/* Volumes component will be added here */}
            </Paper>
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MangaDetails;

import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { fetchMangaCoverImageAsBlobUrl } from "../services/imageService";
import {
  getMangaDetails,
  updateMangaDetails,
  deleteManga,
} from "../services/mangaService";
import { Manga, OwnershipStatus } from "../api/models";
import MangaForm from "../components/MangaForm";
import VolumeManager from "../components/VolumeManager";
import { useUser } from "../context/UserContext";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateMangaQueries } from "../services/queryInvalidation";
import { notify } from "../services/notificationService";
import { useTranslation } from "react-i18next";
import { useStatusMeta } from "../hooks/useStatusMeta";
import { useOwnershipStatus } from "../hooks/useOwnershipStatus";
import { useCategoryLabel } from "../hooks/useCategoryLabel";
import { formatVolumeRange, missingVolumesOf } from "../utils/wishlist";

// The label of the back button, depending on where it leads.
const BACK_LABELS: Record<string, string> = {
  list: "common.backToList",
  wishlist: "common.backToWishlist",
  history: "common.back",
  dashboard: "common.backToDashboard",
};

const MangaDetails: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useUser();
  const { getStatusLabel, getStatusColor } = useStatusMeta();
  const { getOwnershipLabel, getOwnershipColor } = useOwnershipStatus();
  const getCategoryLabel = useCategoryLabel();
  const [manga, setManga] = useState<Manga | null>(null);
  const [loadFailed, setLoadFailed] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const imageUrlRef = useRef<string>("");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchManga = async () => {
      if (!id) {
        return;
      }
      try {
        const mangaData = await getMangaDetails(Number(id));
        setManga(mangaData);
        setLoadFailed(false);
      } catch {
        // The request failed - show an error instead of an endless spinner.
        setLoadFailed(true);
      }
    };

    fetchManga();
  }, [id]);

  useEffect(() => {
    if (!manga?.coverImage) {
      return;
    }

    let isMounted = true;
    const fetchImage = async () => {
      const url = await fetchMangaCoverImageAsBlobUrl(manga.coverImage!);
      if (!isMounted) {
        // The effect was cleaned up while the request was in flight - release
        // the blob URL we just created instead of leaking it.
        if (url) {
          URL.revokeObjectURL(url);
        }
        return;
      }
      imageUrlRef.current = url;
      setImageUrl(url);
    };

    fetchImage();

    return () => {
      isMounted = false;
      // Revoke the URL that was actually created. Reading it from the state
      // here would use the value from the render the effect started in, which
      // is stale and leaves the blob URL alive.
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
        imageUrlRef.current = "";
      }
    };
  }, [manga?.coverImage]);

  // Where does the back button lead? The wishlist and a list are known by
  // the state they pass along, everything else goes back to the page the
  // user came from. A manga that was opened directly - in a new tab, for
  // example - has no page to go back to.
  const backTarget = useMemo(() => {
    if (location.state?.from === "list-detail" && location.state?.listId) {
      return { path: `/lists/${location.state.listId}`, label: "list" };
    }
    if (location.state?.from === "wishlist") {
      return { path: "/wishlist", label: "wishlist" };
    }
    if ((window.history.state?.idx ?? 0) > 0) {
      return { path: null, label: "history" };
    }
    return { path: "/", label: "dashboard" };
  }, [location.state]);

  const handleBackClick = () => {
    if (backTarget.path) {
      navigate(backTarget.path);
      return;
    }
    navigate(-1);
  };

  if (loadFailed) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {t("manga.loadFailed")}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackClick}>
          {t(BACK_LABELS[backTarget.label])}
        </Button>
      </Container>
    );
  }

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
        <Typography>{t("common.loading")}</Typography>
      </Box>
    );
  }

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (id) {
      try {
        // A failed request resolves to null. Without this check the user is
        // sent back to the dashboard although the title is still there.
        const deleted = await deleteManga(Number(id));
        if (!deleted) {
          setDeleteDialogOpen(false);
          return;
        }
        await invalidateMangaQueries(queryClient);
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
      // A failed request resolves to null. The error was already reported
      // by the request itself - showing the success message here would tell
      // the user that the save worked when it did not.
      if (!savedManga) {
        return;
      }
      setManga(savedManga);
      setEditMode(false);
      await invalidateMangaQueries(queryClient);
      setNotification({
        open: true,
        message: t("manga.updatedSuccess"),
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to update manga:", error);
      setNotification({
        open: true,
        message: t("manga.updateFailed"),
        severity: "error",
      });
    }
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  // The volumes of the series that are still missing. Without a known total
  // the app cannot tell which ones are missing - only the gaps between the
  // volumes that are on the shelf.
  const missingVolumes = missingVolumesOf(manga);
  const totalKnown = Boolean(manga.totalVolumes);
  const canWishlistTheRest =
    isAdmin &&
    totalKnown &&
    missingVolumes.length > 0 &&
    manga.ownershipStatus === OwnershipStatus.Owned;

  // Put the rest of the series on the wishlist. The volumes that are
  // already on the shelf stay where they are - the title keeps them and is
  // wanted at the same time.
  const handleAddMissingToWishlist = async () => {
    try {
      const updated = await updateMangaDetails({
        ...manga,
        ownershipStatus: OwnershipStatus.Wishlist,
      });
      // A failed request resolves to null. Setting the state to null would
      // leave the page on its endless spinner.
      if (!updated) {
        return;
      }
      setManga(updated);
      await invalidateMangaQueries(queryClient);
      notify(t("wishlist.addedToWishlist"), "success");
    } catch (error) {
      console.error(
        "Failed to add the missing volumes to the wishlist:",
        error,
      );
      notify(t("wishlist.actionFailed"), "error");
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackClick}>
          {t(BACK_LABELS[backTarget.label])}
        </Button>
        {isAdmin && (
          <Box>
            <IconButton onClick={handleToggleEditMode} sx={{ mr: 1 }}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={handleDeleteClick} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>{t("manga.deleteTitle")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("manga.deleteConfirm", { title: manga.title })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>{t("common.cancel")}</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            {t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      {editMode ? (
        <MangaForm manga={manga} onSave={handleSave} onCancel={handleCancel} />
      ) : (
        <Grid container spacing={3}>
          {/* Cover Image Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={3}
              sx={{
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                height: "fit-content",
                background:
                  theme.palette.mode === "dark"
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
                  <Box
                    component="img"
                    src={imageUrl}
                    alt={manga.title}
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
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
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.grey[900], 0.8)
                        : alpha(theme.palette.grey[200], 0.8),
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    {t("common.noCoverImage")}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Details Section */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                height: "fit-content",
                display: "flex",
                flexDirection: "column",
                background:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.background.paper, 0.8)
                    : alpha(theme.palette.background.paper, 0.9),
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {manga.title}
                  </Typography>
                  {manga.japaneseTitle && (
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      gutterBottom
                    >
                      {manga.japaneseTitle}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Status Badges */}
              <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
                {manga.ownershipStatus && (
                  <Chip
                    label={`${t("manga.ownershipStatus")}: ${getOwnershipLabel(
                      manga.ownershipStatus,
                    )}`}
                    sx={{
                      bgcolor: getOwnershipColor(manga.ownershipStatus),
                      color: "white",
                      fontWeight: 500,
                    }}
                  />
                )}
                {manga.readingStatus && (
                  <Chip
                    label={`${t("manga.readingStatus")}: ${getStatusLabel(
                      manga.readingStatus,
                    )}`}
                    sx={{
                      bgcolor: getStatusColor(manga.readingStatus),
                      color: "white",
                      fontWeight: 500,
                    }}
                  />
                )}
                {manga.overallStatus && (
                  <Chip
                    label={`${t("manga.overallStatus")}: ${getStatusLabel(
                      manga.overallStatus,
                    )}`}
                    sx={{
                      bgcolor: getStatusColor(manga.overallStatus),
                      color: "white",
                      fontWeight: 500,
                    }}
                  />
                )}
                {manga.category && (
                  <Chip
                    label={getCategoryLabel(manga.category)}
                    sx={{
                      bgcolor:
                        theme.palette.mode === "dark"
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
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {t("common.authors")}
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

                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {t("common.genres")}
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
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {t("common.summary")}
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {manga.summary}
                  </Typography>
                </Box>
              )}

              {/* Additional Details */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t("common.language")}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {manga.language || t("common.notAvailable")}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t("common.rating")}
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
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {t("common.lists")}
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
          <Grid size={{ xs: 12 }}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                background:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.background.paper, 0.8)
                    : alpha(theme.palette.background.paper, 0.9),
              }}
            >
              {manga && (
                <VolumeManager
                  manga={manga}
                  onUpdate={async () => {
                    const updatedManga = await getMangaDetails(manga.id);
                    setManga(updatedManga);
                  }}
                />
              )}

              {/* The rest of the series can go on the wishlist. */}
              {manga.totalVolumes && missingVolumes.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {t("wishlist.missingVolumes", {
                      count: missingVolumes.length,
                      range: formatVolumeRange(missingVolumes),
                    })}
                  </Typography>
                  {canWishlistTheRest ? (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleAddMissingToWishlist}
                      sx={{ alignSelf: "flex-start" }}
                    >
                      {t("wishlist.addMissingToWishlist")}
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t("wishlist.missingVolumesHint")}
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MangaDetails;

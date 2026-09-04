import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Rating,
  Snackbar,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import MangaForm from "../components/MangaForm";
import MangaStatusChip from "../components/MangaStatusChip";
import VolumeShelf from "../components/volumeShelf/VolumeShelf";
import { useUser } from "../context/UserContext";
import { Manga } from "../api/models";
import {
  deleteManga,
  getMangaDetails,
  updateMangaDetails,
} from "../services/mangaService";
import { getMangaCoverImageUrl } from "../services/imageService";

const SUMMARY_COLLAPSE_THRESHOLD = 280;

const MangaDetails: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useUser();

  const mangaId = id ? Number(id) : 0;
  const queryKey = ["manga", mangaId];

  const mangaQuery = useQuery<Manga | null>({
    queryKey,
    queryFn: async () => (mangaId ? await getMangaDetails(mangaId) : null),
    enabled: mangaId > 0,
  });

  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const manga = mangaQuery.data ?? null;

  const notify = (message: string, severity: "success" | "error" = "success") =>
    setNotification({ open: true, message, severity });

  const handleBackClick = () => {
    if (location.state?.from === "list-detail" && location.state?.listId) {
      navigate(`/lists/${location.state.listId}`);
    } else {
      navigate("/");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteManga(mangaId);
      await queryClient.invalidateQueries({ queryKey: ["mangas"] });
      await queryClient.invalidateQueries({ queryKey: ["lists"] });
      navigate("/");
    } catch (error) {
      console.error("Failed to delete manga:", error);
      notify(t("manga.deleteFailed"), "error");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleSave = async (updatedManga: Manga, coverImage?: File) => {
    try {
      const saved = await updateMangaDetails(updatedManga, coverImage);
      queryClient.setQueryData(queryKey, saved);
      await queryClient.invalidateQueries({ queryKey: ["mangas"] });
      await queryClient.invalidateQueries({ queryKey: ["lists"] });
      setEditMode(false);
      notify(t("manga.updatedSuccess"), "success");
    } catch (error) {
      console.error("Failed to update manga:", error);
      notify(t("manga.updateFailed"), "error");
    }
  };

  const handleCancel = () => setEditMode(false);
  const handleCloseNotification = () =>
    setNotification((prev) => ({ ...prev, open: false }));

  if (mangaQuery.isLoading || !manga) {
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

  const summaryTooLong =
    !!manga.summary && manga.summary.length > SUMMARY_COLLAPSE_THRESHOLD;

  // ---- Wood-grain "table" backdrop ----
  // Layered: warm wood base + vertical wood-grain stripes + a soft warm light
  // from above + a vignette toward the edges.
  const tableBg = `
    repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent 18px,
      rgba(40, 18, 6, 0.18) 18px,
      rgba(40, 18, 6, 0.18) 19px
    ),
    repeating-linear-gradient(
      0deg,
      transparent 0,
      transparent 60px,
      rgba(60, 28, 10, 0.22) 60px,
      rgba(60, 28, 10, 0.22) 62px,
      transparent 62px,
      transparent 110px,
      rgba(80, 40, 16, 0.12) 110px,
      rgba(80, 40, 16, 0.12) 112px
    ),
    radial-gradient(ellipse 90% 60% at 50% 25%, rgba(255, 220, 165, 0.55), transparent 65%),
    radial-gradient(ellipse 100% 100% at 50% 50%, transparent 30%, rgba(20, 8, 0, 0.45) 95%),
    linear-gradient(180deg, #8b5a2b 0%, #6b3f1c 50%, #4a2810 100%)
  `;

  // ---- Paper surface for the open book ----
  // Layered: very subtle paper fiber + warm cream gradient + a darker edge
  // vignette around the page to mimic how paper looks darker at the binding.
  const pageBg = `
    repeating-linear-gradient(
      0deg,
      rgba(120, 90, 60, 0.05) 0 1px,
      transparent 1px 3px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(120, 90, 60, 0.03) 0 1px,
      transparent 1px 4px
    ),
    radial-gradient(ellipse at center, #fff7e2 0%, #f3e6c1 70%, #e0cf9d 100%)
  `;
  const pageBgDark = `
    repeating-linear-gradient(
      0deg,
      rgba(255, 240, 200, 0.04) 0 1px,
      transparent 1px 3px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(255, 240, 200, 0.03) 0 1px,
      transparent 1px 4px
    ),
    radial-gradient(ellipse at center, #3a2c1e 0%, #2a1f15 70%, #1a1208 100%)
  `;

  // Spine gutter — a darker wood strip between the two pages.
  const spineBg = theme.palette.mode === "dark"
    ? "linear-gradient(90deg, #1a120a 0%, #3a2410 50%, #1a120a 100%)"
    : "linear-gradient(90deg, #6b4015 0%, #8b5a2b 50%, #6b4015 100%)";

  // Big, grounded shadow under the whole spread.
  const spreadShadow = `
    0 50px 100px rgba(20, 8, 0, 0.55),
    0 20px 40px rgba(20, 8, 0, 0.4),
    0 6px 12px rgba(20, 8, 0, 0.25)
  `;

  const isDark = theme.palette.mode === "dark";
  const pageSurface = isDark ? pageBgDark : pageBg;
  const spineColor = spineBg;

  const coverUrl = manga.coverImage
    ? getMangaCoverImageUrl(manga.coverImage)
    : "";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background: tableBg,
        backgroundAttachment: "fixed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        py: { xs: 4, md: 6 },
        px: 2,
      }}
    >
      {/* Top toolbar — caps at the spread width. */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 1280,
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackClick}>
          {location.state?.from === "list-detail"
            ? t("common.backToList")
            : t("common.backToDashboard")}
        </Button>
        {isAdmin && (
          <Box>
            <IconButton
              onClick={() => setEditMode((v) => !v)}
              sx={{ mr: 1 }}
              aria-label="edit"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => setDeleteDialogOpen(true)}
              color="error"
              aria-label="delete"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t("manga.deleteTitle")}</DialogTitle>
        <DialogContent>
          <Typography>{t("manga.deleteConfirm")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t("common.cancel")}
          </Button>
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
        /* THE OPENED BOOK — fills the viewport: wide spread, big pages, real
           drop shadow. Both pages share a fixed height via matching
           aspect-ratio so the layout never shifts. */
        <Box
          sx={{
            width: "100%",
            maxWidth: 1280,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 14px 1fr" },
            gap: { xs: 2, md: 0 },
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: spreadShadow,
            transform: {
              xs: "none",
              md: "perspective(2400px) rotateZ(1.2deg)",
            },
            transformOrigin: "50% 50%",
          }}
        >
          {/* LEFT PAGE — cover. Fixed manga-cover aspect (2:3). */}
          <Box
            sx={{
              position: "relative",
              background: pageSurface,
              // 2:3 portrait aspect — always the same regardless of info-page
              // content. Insets the cover inside the page with paper showing.
              paddingTop: { xs: "140%", md: "150%" },
              borderRight: {
                md: "1px solid rgba(0,0,0,0.06)",
              },
              // Inner shadow at the spine gutter + a soft outer vignette.
              boxShadow:
                "inset -22px 0 28px -18px rgba(40,20,8,0.45), inset 0 0 80px rgba(40,20,8,0.18)",
            }}
          >
            {coverUrl ? (
              <Box
                component="img"
                src={coverUrl}
                alt={manga.title}
                loading="lazy"
                sx={{
                  position: "absolute",
                  top: "6%",
                  left: "9%",
                  right: "9%",
                  bottom: "7%",
                  width: "82%",
                  height: "87%",
                  objectFit: "contain",
                  borderRadius: "2px",
                  // Tilt the cover on the page so it looks casually placed.
                  transform:
                    "perspective(1200px) rotateZ(-1.5deg) rotateY(10deg)",
                  transformOrigin: "center center",
                  boxShadow: `
                    0 22px 38px rgba(0,0,0,0.5),
                    0 6px 12px rgba(0,0,0,0.35),
                    inset 0 0 0 1px rgba(255,255,255,0.05)
                  `,
                }}
              />
            ) : (
              <Box
                sx={{
                  position: "absolute",
                  inset: "10%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  {t("common.noCoverImage")}
                </Typography>
              </Box>
            )}
          </Box>

          {/* CENTER SPINE — narrow wooden strip with a paper-edge gradient. */}
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              background: spineColor,
              boxShadow: `
                inset 2px 0 4px rgba(0,0,0,0.6),
                inset -2px 0 4px rgba(0,0,0,0.6),
                0 0 8px rgba(0,0,0,0.3)
              `,
            }}
          />

          {/* RIGHT PAGE — info. Matches the cover page's height via aspect-
              ratio so both pages are exactly the same size; internal scroll
              if content overflows. */}
          <Box
            sx={{
              position: "relative",
              background: pageSurface,
              p: { xs: 3, md: 5 },
              display: "flex",
              flexDirection: "column",
              gap: 1.75,
              // Match cover page aspect exactly so both columns are the same
              // height — height never changes regardless of summary state.
              aspectRatio: { xs: "auto", md: "1 / 1.5" },
              overflowY: { xs: "visible", md: "auto" },
              boxShadow: `
                inset 22px 0 28px -18px rgba(40,20,8,0.45),
                inset 0 0 80px rgba(40,20,8,0.18)
              `,
            }}
          >
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  letterSpacing: -0.5,
                  lineHeight: 1.1,
                }}
              >
                {manga.title}
              </Typography>
              {manga.japaneseTitle && (
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{ fontStyle: "italic", mt: 0.5 }}
                >
                  {manga.japaneseTitle}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <MangaStatusChip status={manga.readingStatus} />
              <MangaStatusChip status={manga.overallStatus} />
              {manga.category && (
                <Chip label={manga.category} size="small" sx={{ fontWeight: 500 }} />
              )}
            </Box>

            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: 1 }}
              >
                {t("common.authors")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                {manga.authors.map((author) => (
                  <Chip
                    key={author.id}
                    label={author.name}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: 1 }}
              >
                {t("common.genres")}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
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

            <Divider sx={{ my: 0.5 }} />

            {manga.summary && (
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ letterSpacing: 1 }}
                >
                  {t("common.summary")}
                </Typography>
                <Collapse
                  in={summaryExpanded || !summaryTooLong}
                  collapsedSize={summaryTooLong ? "5em" : undefined}
                >
                  <Typography
                    variant="body1"
                    sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}
                  >
                    {manga.summary}
                  </Typography>
                </Collapse>
                {summaryTooLong && (
                  <Button
                    size="small"
                    onClick={() => setSummaryExpanded((v) => !v)}
                    sx={{ mt: 0.5, px: 0 }}
                  >
                    {summaryExpanded ? t("manga.showLess") : t("manga.readMore")}
                  </Button>
                )}
              </Box>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ letterSpacing: 1 }}
                >
                  {t("common.language")}
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.25 }}>
                  {manga.language || "N/A"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ letterSpacing: 1 }}
                >
                  {t("common.rating")}
                </Typography>
                <Rating
                  value={manga.starRating || 0}
                  precision={0.5}
                  readOnly
                  sx={{ mt: 0.25 }}
                />
              </Grid>
            </Grid>

            {manga.lists.length > 0 && (
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ letterSpacing: 1 }}
                >
                  {t("common.lists")}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
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
          </Box>
        </Box>
      )}

      {/* SHELF — caps at the spread's width so it stays centered. */}
      <Box sx={{ width: "100%", maxWidth: 1280, mt: 5 }}>
        <VolumeShelf
          manga={manga}
          onChanged={() => mangaQuery.refetch()}
          onError={(msg) => notify(msg, "error")}
        />
      </Box>

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
    </Box>
  );
};

export default MangaDetails;

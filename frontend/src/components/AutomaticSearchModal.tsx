import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  CardMedia,
  useMediaQuery,
  useTheme,
  InputLabel,
  FormControl,
  Alert,
  Snackbar,
  Skeleton,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { getSources, getSearchResults } from "../services/sourceService";
import { createManga } from "../services/mangaService";
import { Source, MangaCreate, VolumeCreate } from "../api/models";
import { parseVolumeString } from "../utils/volumeUtils";
import { HighlightOff } from "@mui/icons-material";

interface AutomaticSearchModalProps {
  open: boolean;
  onClose: () => void;
  onMangaAdded?: () => void; // Callback to refresh dashboard
}

const AutomaticSearchModal: React.FC<AutomaticSearchModalProps> = ({
  open,
  onClose,
  onMangaAdded,
}) => {
  const { t } = useTranslation();
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<MangaCreate[]>([]);
  const [noSourcesAvailable, setNoSourcesAvailable] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [creatingManga, setCreatingManga] = useState<string | null>(null); // Store manga title being created
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Volume Dialog State
  const [volumeDialogOpen, setVolumeDialogOpen] = useState(false);
  const [volumeInput, setVolumeInput] = useState("");
  const [selectedMangaForVolume, setSelectedMangaForVolume] =
    useState<MangaCreate | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchSources = async () => {
      const sources = await getSources();
      setSources(sources);
      if (sources.length > 0) {
        setSelectedSource(sources[0]);
        setNoSourcesAvailable(false);
      } else {
        setNoSourcesAvailable(true);
      }
    };

    fetchSources();
  }, []);

  const handleSearch = async () => {
    if (searchQuery === "") {
      alert(t("manga.pleaseEnterQuery"));
      return;
    }

    if (selectedSource) {
      setIsSearching(true);
      try {
        const results = await getSearchResults(
          searchQuery,
          selectedSource.name
        );
        setSearchResults(results);
        if (results.length === 0) {
          setSnackbar({
            open: true,
            message: t("common.noResults"),
            severity: "error",
          });
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: t("common.errorLoading"),
          severity: "error",
        });
      } finally {
        setIsSearching(false);
      }
    } else {
      setSnackbar({
        open: true,
        message: t("manga.pleaseSelectSource"),
        severity: "error",
      });
    }
  };

  const handleCreateManga = async (manga: MangaCreate) => {
    setCreatingManga(manga.title);
    try {
      await createManga(manga);
      setSnackbar({
        open: true,
        message: t("manga.addedSuccess"),
        severity: "success",
      });
      // Call the callback to refresh dashboard
      onMangaAdded?.();
    } catch (error) {
      setSnackbar({
        open: true,
        message: t("manga.addError"),
        severity: "error",
      });
    } finally {
      setCreatingManga(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleOpenVolumeDialog = (manga: MangaCreate) => {
    setSelectedMangaForVolume(manga);
    setVolumeInput("");
    setVolumeDialogOpen(true);
  };

  const handleConfirmVolumeAdd = async () => {
    if (!selectedMangaForVolume) return;

    const volumeNumbers = parseVolumeString(volumeInput);
    const volumes: VolumeCreate[] = volumeNumbers.map((num) => ({
      volumeNumber: num.toString(),
      mangaId: 0, // Temporary, backend handles this or ignores it for create
    }));

    // We need to clone the manga and add volumes
    const mangaWithVolumes = {
      ...selectedMangaForVolume,
      volumes: volumes,
    };

    setVolumeDialogOpen(false);
    await handleCreateManga(mangaWithVolumes);
  };

  const renderSearchResults = () => {
    if (isSearching) {
      return Array(3)
        .fill(0)
        .map((_, index) => (
          <Card
            key={index}
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              mb: 2,
            }}
          >
            <Skeleton
              variant="rectangular"
              width={isMobile ? "100%" : 151}
              height={isMobile ? 200 : 151}
            />
            <CardContent sx={{ flex: "1 1 auto" }}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="90%" height={20} sx={{ mt: 1 }} />
              <Skeleton
                variant="text"
                width="90%"
                height={20}
                sx={{ mt: 0.5 }}
              />
              <Skeleton
                variant="text"
                width="90%"
                height={20}
                sx={{ mt: 0.5 }}
              />
              <Skeleton
                variant="rectangular"
                width={120}
                height={36}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        ));
    }

    return searchResults.map((manga) => (
      <Card
        key={manga.title}
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          mb: 2,
        }}
      >
        <CardMedia
          component="img"
          sx={{
            width: isMobile ? "100%" : 151,
            height: isMobile ? 200 : "auto",
          }}
          image={
            manga.coverImage || "/static/images/cards/contemplative-reptile.jpg"
          }
          alt={manga.title}
        />
        <CardContent sx={{ flex: "1 1 auto" }}>
          <Typography
            component="div"
            variant="h6"
            sx={{ whiteSpace: "normal", wordBreak: "break-word" }}
          >
            {manga.title}
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            component="div"
            sx={{ whiteSpace: "normal", wordBreak: "break-word" }}
          >
            {manga.authors.map((author) => author.name).join(", ")}
          </Typography>
          <Typography
            variant="body2"
            component="div"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: isMobile ? "none" : "3",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "normal",
              wordBreak: "break-word",
            }}
          >
            {manga.summary}
          </Typography>
          <Button
            variant="contained"
            onClick={() => handleCreateManga(manga)}
            disabled={creatingManga === manga.title}
            sx={{ mt: 1, mr: 1 }}
          >
            {creatingManga === manga.title ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                {t("common.adding")}
              </>
            ) : (
              t("manga.addToDatabase")
            )}
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleOpenVolumeDialog(manga)}
            disabled={creatingManga === manga.title}
            sx={{ mt: 1 }}
          >
            {t("common.addWithVolumes")}
          </Button>
        </CardContent>
      </Card>
    ));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>{t("manga.searchManga")}</DialogTitle>
        <DialogContent>
          {noSourcesAvailable && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t("manga.noSourcesAvailable")}
            </Alert>
          )}
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "stretch" : "center",
              gap: 2,
              mt: 2,
            }}
          >
            <TextField
              fullWidth
              label={t("manga.searchManga")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              disabled={isSearching}
              slotProps={{
                input: {
                  endAdornment: <InputAdornment position="end">
                    <IconButton
                      onClick={() => setSearchQuery("")}>
                      <HighlightOff />
                    </IconButton>
                  </InputAdornment>,
                },
              }}
            />
            <FormControl fullWidth>
              <InputLabel>{t("manga.selectSource")}</InputLabel>
              <Select
                value={selectedSource ? selectedSource.id : ""}
                onChange={(e) => {
                  const source = sources.find((s) => s.id === e.target.value);
                  setSelectedSource(source || null);
                }}
                fullWidth
                label={t("manga.selectSource")}
                disabled={isSearching}
              >
                {sources.map((source) => (
                  <MenuItem key={source.id} value={source.id}>
                    {`${source.name} (${source.language})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={isSearching}
              sx={{ height: isMobile ? "auto" : "56px" }}
            >
              {isSearching ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                  {t("common.searching")}
                </>
              ) : (
                t("common.search")
              )}
            </Button>
          </Box>
          {searchResults.length > 0 && (
            <Box mt={2}>
              <Typography variant="h6">{t("manga.searchResults")}</Typography>
              <Box>{renderSearchResults()}</Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t("common.close")}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={volumeDialogOpen}
        onClose={() => setVolumeDialogOpen(false)}
      >
        <DialogTitle>{t("common.addWithVolumes")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("volume.enterVolumesYouOwn")}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="volumes"
            label={t("volume.volumes")}
            type="text"
            fullWidth
            variant="outlined"
            value={volumeInput}
            onChange={(e) => setVolumeInput(e.target.value)}
            placeholder={t("volume.e.gVolumes")}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVolumeDialogOpen(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleConfirmVolumeAdd} variant="contained">
            {t("manga.addToDatabase")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AutomaticSearchModal;

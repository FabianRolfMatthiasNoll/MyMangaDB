import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StarIcon from "@mui/icons-material/Star";
import { Manga, OwnershipStatus } from "../api/models";
import { getMangaCoverImageUrl } from "../services/imageService";
import {
  addVolumesToCollection,
  completeSeries as completeSeriesRequest,
  removeFromWishlist,
  setOwnershipStatus,
  setPriority,
} from "../services/wishlistService";
import { notify } from "../services/notificationService";
import { invalidateMangaQueries } from "../services/queryInvalidation";
import { useUser } from "../context/UserContext";
import { useOwnershipStatus } from "../hooks/useOwnershipStatus";
import {
  formatVolumeRange,
  missingVolumesOf,
  ownedVolumesOf,
  seriesVolumesOf,
} from "../utils/wishlist";
import { parseVolumeString } from "../utils/volumeUtils";
import VolumeStrip from "./VolumeStrip";

interface WishlistCardProps {
  manga: Manga;
}

/**
 * A title on the wishlist.
 *
 * It looks deliberately different from a card in the collection: a dashed
 * border and the accent colour of the wishlist, so a wanted title is never
 * mistaken for one that is already on the shelf.
 */
const WishlistCard: React.FC<WishlistCardProps> = ({ manga }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { isAdmin } = useUser();
  const { getOwnershipLabel, getOwnershipColor } = useOwnershipStatus();

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [addVolumesOpen, setAddVolumesOpen] = useState(false);
  const [volumeInput, setVolumeInput] = useState("");
  const [busy, setBusy] = useState(false);

  const missing = missingVolumesOf(manga);
  const volumes = seriesVolumesOf(manga);
  const owned = ownedVolumesOf(manga);

  const refresh = async () => {
    await invalidateMangaQueries(queryClient);
  };

  const runAction = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
      await refresh();
    } catch (error) {
      console.error("Wishlist action failed", error);
      notify(t("wishlist.actionFailed"), "error");
    } finally {
      setBusy(false);
      setMenuAnchor(null);
    }
  };

  const handleCompleteSeries = () =>
    runAction(() => completeSeriesRequest(manga));

  const handleOpenAddVolumes = () => {
    setVolumeInput("");
    setAddVolumesOpen(true);
    setMenuAnchor(null);
  };

  // Some of the wanted volumes arrived - they move into the collection, the
  // rest stays on the wishlist.
  const handleAddVolumes = async () => {
    const numbers = parseVolumeString(volumeInput);
    if (numbers.length === 0) {
      notify(t("wishlist.noVolumesEntered"), "error");
      return;
    }

    setBusy(true);
    try {
      await addVolumesToCollection(manga, numbers);
      await refresh();
      setAddVolumesOpen(false);
      notify(t("wishlist.volumesAdded", { count: numbers.length }), "success");
    } catch (error) {
      console.error("Failed to add the volumes", error);
      notify(t("wishlist.actionFailed"), "error");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = () =>
    runAction(async () => {
      // The removal has to report back whether it worked. Otherwise the
      // user is told that the title is gone while it is still there.
      const removed = await removeFromWishlist(manga);
      if (!removed) {
        throw new Error("The title could not be removed");
      }
      notify(t("wishlist.removed", { title: manga.title }), "success");
    });

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        borderStyle: "dashed",
        borderWidth: 2,
        borderColor: alpha(theme.palette.secondary.main, 0.6),
        background: alpha(theme.palette.secondary.main, 0.04),
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
        <Box
          component={Link}
          to={`/manga/${manga.id}`}
          state={{ from: "wishlist" }}
          sx={{ flexShrink: 0, display: "block" }}
        >
          {manga.coverImage ? (
            <Box
              component="img"
              src={getMangaCoverImageUrl(manga.coverImage)}
              alt={manga.title}
              loading="lazy"
              sx={{
                width: 64,
                height: 96,
                objectFit: "cover",
                borderRadius: 1,
                opacity: 0.85,
              }}
            />
          ) : (
            <Box
              sx={{
                width: 64,
                height: 96,
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.action.disabledBackground, 0.3),
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {t("common.noCoverImage")}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <Typography
              variant="h6"
              component={Link}
              to={`/manga/${manga.id}`}
              state={{ from: "wishlist" }}
              sx={{
                color: "inherit",
                textDecoration: "none",
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                // Without this the ellipsis never kicks in and a long
                // title wraps over several lines.
                whiteSpace: "nowrap",
              }}
            >
              {manga.title}
            </Typography>
            {isAdmin && (
              <IconButton
                size="small"
                aria-label={t("wishlist.actions")}
                disabled={busy}
                onClick={(event) => setMenuAnchor(event.currentTarget)}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
          {manga.authors.length > 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {manga.authors.map((author) => author.name).join(", ")}
            </Typography>
          )}

          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
            <Chip
              label={getOwnershipLabel(manga.ownershipStatus)}
              size="small"
              sx={{
                bgcolor: getOwnershipColor(manga.ownershipStatus),
                color: "white",
              }}
            />
            {manga.priority && (
              <Chip
                icon={<StarIcon />}
                label={t("wishlist.priority")}
                size="small"
                color="warning"
              />
            )}
            {manga.language && (
              <Chip label={manga.language} size="small" variant="outlined" />
            )}
          </Stack>
        </Box>
      </Stack>

      {volumes.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {missing.length > 0
              ? t("wishlist.missingVolumes", {
                  count: missing.length,
                  range: formatVolumeRange(missing),
                })
              : t("wishlist.nothingMissing")}
          </Typography>
          <VolumeStrip
            volumes={volumes}
            // A filled square means the same thing everywhere: the volume
            // is on the shelf. The empty ones are what is still wanted.
            filled={new Set(owned)}
            filledLabel={t("volume.owned")}
            emptyLabel={t("wishlist.missing")}
          />
        </Box>
      )}

      {isAdmin && missing.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            size="small"
            disabled={busy}
            onClick={handleCompleteSeries}
          >
            {t("wishlist.completeSeries")}
          </Button>
          <Button
            variant="outlined"
            size="small"
            disabled={busy}
            onClick={handleOpenAddVolumes}
          >
            {t("wishlist.addVolumes")}
          </Button>
        </Stack>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={handleOpenAddVolumes}
          disabled={missing.length === 0}
        >
          {t("wishlist.addVolumes")}
        </MenuItem>
        <MenuItem
          onClick={() =>
            runAction(() => setOwnershipStatus(manga, OwnershipStatus.Owned))
          }
        >
          {t("wishlist.markAsOwned")}
        </MenuItem>
        <MenuItem
          onClick={() =>
            runAction(() => setOwnershipStatus(manga, OwnershipStatus.Ordered))
          }
        >
          {t("wishlist.markAsOrdered")}
        </MenuItem>
        <MenuItem
          onClick={() => runAction(() => setPriority(manga, !manga.priority))}
        >
          {manga.priority
            ? t("wishlist.clearPriority")
            : t("wishlist.priority")}
        </MenuItem>
        <MenuItem onClick={() => setRemoveOpen(true)}>
          {t("wishlist.remove")}
        </MenuItem>
      </Menu>

      <Dialog
        open={addVolumesOpen}
        onClose={() => setAddVolumesOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t("wishlist.addVolumesTitle")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("wishlist.addVolumesDescription")}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="receivedVolumes"
            label={t("wishlist.receivedVolumes")}
            type="text"
            fullWidth
            variant="outlined"
            value={volumeInput}
            onChange={(event) => setVolumeInput(event.target.value)}
            placeholder={t("volume.e.gVolumes")}
            helperText={
              missing.length > 0
                ? t("wishlist.missingVolumesHint", {
                    range: formatVolumeRange(missing),
                  })
                : undefined
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddVolumesOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="contained"
            disabled={busy}
            onClick={handleAddVolumes}
          >
            {t("wishlist.addVolumes")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={removeOpen} onClose={() => setRemoveOpen(false)}>
        <DialogTitle>{t("wishlist.removeTitle")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("wishlist.removeConfirm", { title: manga.title })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={busy}
            onClick={handleRemove}
          >
            {t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default WishlistCard;

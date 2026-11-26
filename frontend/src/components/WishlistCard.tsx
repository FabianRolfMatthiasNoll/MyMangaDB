import React, { useState } from "react";
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StarIcon from "@mui/icons-material/Star";
import { Manga, OwnershipStatus } from "../api/models";
import {
  addVolumesToCollection,
  completeSeries as completeSeriesRequest,
  removeFromWishlist,
  setOwnershipStatus,
  setPriority,
  setSeriesLength,
} from "../services/wishlistService";
import { notify } from "../services/notificationService";
import { invalidateMangaQueries } from "../services/queryInvalidation";
import { useUser } from "../context/UserContext";
import {
  formatVolumeRange,
  missingVolumesOf,
  ownedVolumesOf,
  seriesVolumesOf,
} from "../utils/wishlist";
import { parseVolumeString } from "../utils/volumeUtils";
import VolumeStrip from "./VolumeStrip";
import MangaCard from "./MangaCard";
import MobileMangaListItem from "./MobileMangaListItem";

interface WishlistCardProps {
  manga: Manga;
}

/**
 * A title on the wishlist.
 *
 * The card itself is the same card that the dashboard shows, so a title
 * looks the same wherever it appears. What is wanted is only wanted: the
 * details of the series and the actions are in the panel below it.
 */
const WishlistCard: React.FC<WishlistCardProps> = ({ manga }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  // The dashboard switches to the list at the same point, so that a title
  // looks the same on both pages.
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const queryClient = useQueryClient();
  const { isAdmin } = useUser();

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [addVolumesOpen, setAddVolumesOpen] = useState(false);
  const [volumeInput, setVolumeInput] = useState("");
  const [lengthOpen, setLengthOpen] = useState(false);
  const [lengthInput, setLengthInput] = useState("");
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

  const handleOpenLength = () => {
    setLengthInput(
      manga.totalVolumes !== null && manga.totalVolumes !== undefined
        ? String(manga.totalVolumes)
        : "",
    );
    setLengthOpen(true);
    setMenuAnchor(null);
  };

  // How many volumes the series has in total. The volumes that are not on
  // the shelf are the ones that are wanted.
  const handleSaveLength = async () => {
    const total = Number(lengthInput.trim());
    if (!Number.isInteger(total) || total < 0) {
      notify(t("wishlist.noSeriesLength"), "error");
      return;
    }

    setBusy(true);
    try {
      await setSeriesLength(manga, total === 0 ? null : total);
      await refresh();
      setLengthOpen(false);
      notify(t("wishlist.seriesLengthSaved"), "success");
    } catch (error) {
      console.error("Failed to save the series length", error);
      notify(t("wishlist.actionFailed"), "error");
    } finally {
      setBusy(false);
    }
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {isMobile ? (
        <MobileMangaListItem manga={manga} from="wishlist" />
      ) : (
        <MangaCard manga={manga} alwaysShowDetails from="wishlist" />
      )}

      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          borderRadius: 2,
          borderStyle: "dashed",
          borderWidth: 2,
          borderColor: alpha(theme.palette.secondary.main, 0.6),
          background: alpha(theme.palette.secondary.main, 0.04),
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
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
              // The card is in a grid, so a long series would need row after
              // row of squares. The rest is behind the overflow.
              max={12}
            />
          </Box>
        )}

        <Stack
          direction="row"
          spacing={1}
          sx={{ flexWrap: "wrap", alignItems: "center" }}
        >
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
          {isAdmin && missing.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              disabled={busy}
              onClick={handleCompleteSeries}
            >
              {t("wishlist.completeSeries")}
            </Button>
          )}
          {isAdmin && (
            <>
              <Button
                variant="outlined"
                size="small"
                disabled={busy}
                onClick={handleOpenAddVolumes}
              >
                {t("wishlist.addVolumes")}
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={busy}
                onClick={handleOpenLength}
              >
                {t("wishlist.setSeriesLength")}
              </Button>
            </>
          )}
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
      </Paper>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={handleOpenAddVolumes}>
          {t("wishlist.addVolumes")}
        </MenuItem>
        <MenuItem onClick={handleOpenLength}>
          {t("wishlist.setSeriesLength")}
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

      <Dialog
        open={lengthOpen}
        onClose={() => setLengthOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{t("wishlist.setSeriesLengthTitle")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("wishlist.setSeriesLengthDescription")}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="seriesLength"
            label={t("wishlist.seriesLength")}
            type="number"
            fullWidth
            variant="outlined"
            value={lengthInput}
            onChange={(event) => setLengthInput(event.target.value)}
            slotProps={{ htmlInput: { min: 0 } }}
            helperText={t("wishlist.seriesLengthHint")}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLengthOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="contained"
            disabled={busy}
            onClick={handleSaveLength}
          >
            {t("common.save")}
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
    </Box>
  );
};

export default WishlistCard;

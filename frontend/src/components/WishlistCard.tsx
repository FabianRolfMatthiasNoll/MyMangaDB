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
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StarIcon from "@mui/icons-material/Star";
import { Manga, OwnershipStatus } from "../api/models";
import { getMangaCoverImageUrl } from "../services/imageService";
import {
  completeSeries as completeSeriesRequest,
  removeFromWishlist,
  setOwnershipStatus,
  setPriority,
} from "../services/wishlistService";
import { notify } from "../services/notificationService";
import { useUser } from "../context/UserContext";
import { useOwnershipStatus } from "../hooks/useOwnershipStatus";
import {
  formatVolumeRange,
  missingVolumesOf,
  seriesVolumesOf,
} from "../utils/wishlist";
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
  const [busy, setBusy] = useState(false);

  const missing = missingVolumesOf(manga);
  const volumes = seriesVolumesOf(manga);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    await queryClient.invalidateQueries({ queryKey: ["mangas"] });
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

  const handleRemove = () =>
    runAction(async () => {
      await removeFromWishlist(manga);
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
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          component={Link}
          to={`/manga/${manga.id}`}
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
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography
              variant="h6"
              component={Link}
              to={`/manga/${manga.id}`}
              sx={{
                color: "inherit",
                textDecoration: "none",
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
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

          <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
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
            filled={new Set(missing)}
            filledLabel={t("wishlist.missing")}
            emptyLabel={t("volume.owned")}
            color="secondary"
          />
        </Box>
      )}

      {isAdmin && missing.length > 0 && (
        <Button
          variant="outlined"
          size="small"
          disabled={busy}
          onClick={handleCompleteSeries}
          sx={{ alignSelf: "flex-start" }}
        >
          {t("wishlist.completeSeries")}
        </Button>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() =>
            runAction(() =>
              setOwnershipStatus(manga, OwnershipStatus.Owned)
            )
          }
        >
          {t("wishlist.markAsOwned")}
        </MenuItem>
        <MenuItem
          onClick={() =>
            runAction(() =>
              setOwnershipStatus(manga, OwnershipStatus.Ordered)
            )
          }
        >
          {t("wishlist.markAsOrdered")}
        </MenuItem>
        <MenuItem
          onClick={() => runAction(() => setPriority(manga, !manga.priority))}
        >
          {manga.priority ? t("wishlist.clearPriority") : t("wishlist.priority")}
        </MenuItem>
        <MenuItem onClick={() => setRemoveOpen(true)}>
          {t("wishlist.remove")}
        </MenuItem>
      </Menu>

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

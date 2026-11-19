import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { Manga } from "../api/models";
import { getMangaCoverImageUrl } from "../services/imageService";
import { useOwnershipStatus } from "../hooks/useOwnershipStatus";
import {
  formatVolumeRange,
  missingVolumesOf,
  seriesVolumesOf,
} from "../utils/wishlist";
import VolumeStrip from "./VolumeStrip";

interface WishlistCardProps {
  manga: Manga;
  onCompleteSeries?: (manga: Manga) => void;
}

/**
 * A title on the wishlist.
 *
 * It looks deliberately different from a card in the collection: a dashed
 * border and the accent colour of the wishlist, so a wanted title is never
 * mistaken for one that is already on the shelf.
 */
const WishlistCard: React.FC<WishlistCardProps> = ({
  manga,
  onCompleteSeries,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { getOwnershipLabel, getOwnershipColor } = useOwnershipStatus();

  const missing = missingVolumesOf(manga);
  const volumes = seriesVolumesOf(manga);

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

      {onCompleteSeries && missing.length > 0 && (
        <Button
          variant="outlined"
          size="small"
          onClick={() => onCompleteSeries(manga)}
          sx={{ alignSelf: "flex-start" }}
        >
          {t("wishlist.completeSeries")}
        </Button>
      )}
    </Paper>
  );
};

export default WishlistCard;

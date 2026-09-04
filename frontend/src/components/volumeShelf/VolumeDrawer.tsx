import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";

import { Volume } from "../../api/models";
import { useUser } from "../../context/UserContext";
import {
  getVolumeCoverImageUrl,
  removeVolumeCover,
  uploadVolumeCover,
} from "../../services/volumeImageService";

interface VolumeDrawerProps {
  /** ID of the manga this volume belongs to (required for the upload endpoint). */
  mangaId: number;
  volume: Volume | null;
  isOwned: boolean;
  open: boolean;
  onClose: () => void;
  /** Called after a successful upload or remove so the parent can refetch. */
  onChanged?: () => void;
  /** Called when an upload / remove fails. */
  onError?: (message: string) => void;
}

const VolumeDrawer: React.FC<VolumeDrawerProps> = ({
  mangaId,
  volume,
  isOwned,
  open,
  onClose,
  onChanged,
  onError,
}) => {
  const { t } = useTranslation();
  const { isAdmin } = useUser();
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  if (!volume) {
    return null;
  }

  const coverUrl = volume.coverImage
    ? getVolumeCoverImageUrl(volume.coverImage)
    : "";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadVolumeCover(mangaId, volume.id, file);
      onChanged?.();
    } catch (err) {
      console.error("Failed to upload volume cover", err);
      onError?.(t("volume.coverUpdateFailed"));
    } finally {
      setUploading(false);
      // Reset so selecting the same file twice still fires onChange.
      e.target.value = "";
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await removeVolumeCover(mangaId, volume.id);
      onChanged?.();
    } catch (err) {
      console.error("Failed to remove volume cover", err);
      onError?.(t("volume.coverUpdateFailed"));
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 420 }, p: 0 },
      }}
    >
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h5">
            {t("volume.drawerTitle", { n: volume.volumeNumber })}
          </Typography>
          <IconButton onClick={onClose} size="small" aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            aspectRatio: "2 / 3",
            bgcolor: "background.default",
            borderRadius: 1,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          {coverUrl ? (
            <Box
              component="img"
              src={coverUrl}
              alt={`Volume ${volume.volumeNumber} cover`}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Typography color="text.secondary" sx={{ px: 2, textAlign: "center" }}>
              {t("volume.noCover")}
            </Typography>
          )}
        </Box>

        <Chip
          label={isOwned ? t("volume.shelfOwned") : t("volume.shelfMissing")}
          color={isOwned ? "success" : "default"}
          sx={{ alignSelf: "flex-start" }}
        />

        {isAdmin && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              disabled={uploading || removing}
            >
              {uploading ? t("common.saving") : t("volume.uploadCover")}
              <Box
                component="input"
                type="file"
                accept="image/*"
                onChange={handleUpload}
                sx={{
                  clip: "rect(0 0 0 0)",
                  clipPath: "inset(50%)",
                  height: 1,
                  overflow: "hidden",
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  whiteSpace: "nowrap",
                  width: 1,
                }}
              />
            </Button>
            {volume.coverImage && (
              <Button
                color="error"
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={handleRemove}
                disabled={uploading || removing}
              >
                {removing ? t("common.saving") : t("volume.removeCover")}
              </Button>
            )}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
};

export default VolumeDrawer;

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Manga, Volume } from "../api/models";
import { useUser } from "../context/UserContext";
import { updateMangaDetails } from "../services/mangaService";
import { notify } from "../services/notificationService";

import { parseVolumeString } from "../utils/volumeUtils";
import { ownedVolumesOf } from "../utils/wishlist";
import VolumeStrip from "./VolumeStrip";

interface VolumeManagerProps {
  manga: Manga;
  onUpdate: () => void;
}

const VolumeManager: React.FC<VolumeManagerProps> = ({ manga, onUpdate }) => {
  const { t } = useTranslation();
  const { isAdmin } = useUser();
  const [open, setOpen] = useState(false);
  const [inputString, setInputString] = useState("");
  const [loading, setLoading] = useState(false);

  // Calculate owned volumes and max volume
  const ownedVolumes = new Set(ownedVolumesOf(manga));

  // Generate display array (1 to maxVolume)
  // If no volumes, show nothing or maybe a placeholder
  const displayVolumes = Array.from(
    { length: ownedVolumes.size > 0 ? Math.max(...ownedVolumes) : 0 },
    (_, i) => i + 1
  );

  useEffect(() => {
    if (open) {
      // Convert current volumes to string format for editing
      const sortedVolumes = Array.from(ownedVolumes).sort((a, b) => a - b);
      const ranges: string[] = [];

      let start = sortedVolumes[0];
      let prev = sortedVolumes[0];

      for (let i = 1; i <= sortedVolumes.length; i++) {
        const current = sortedVolumes[i];
        if (current === prev + 1) {
          prev = current;
        } else {
          if (start === prev) {
            ranges.push(`${start}`);
          } else {
            ranges.push(`${start}-${prev}`);
          }
          start = current;
          prev = current;
        }
      }
      setInputString(ranges.join("; "));
    }
    // The input is filled from the volumes of the manga, not from the set
    // that is derived from them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, manga.volumes]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Parse input string
      const newOwnedVolumes = parseVolumeString(inputString);

      // Create new Volume objects
      const newVolumes: Volume[] = newOwnedVolumes.map((num) => ({
        id: 0, // Backend will assign ID
        mangaId: manga.id,
        volumeNumber: num.toString(),
        coverImage: null,
      }));

      // Update manga
      const updatedManga = { ...manga, volumes: newVolumes };
      await updateMangaDetails(updatedManga);
      onUpdate();
      setOpen(false);
    } catch (error) {
      console.error("Failed to update volumes", error);
      notify(t("volume.saveFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">
          {t("volume.volumesOwned", { count: ownedVolumes.size })}
        </Typography>
        {isAdmin && (
          <Button
            startIcon={<EditIcon />}
            variant="outlined"
            size="small"
            onClick={() => setOpen(true)}
          >
            {t("volume.manageVolumesTitle")}
          </Button>
        )}
      </Box>

      {displayVolumes.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t("volume.noVolumesTracked")}
        </Typography>
      ) : (
        <VolumeStrip
          volumes={displayVolumes}
          filled={ownedVolumes}
          filledLabel={t("volume.owned")}
          emptyLabel={t("volume.notOwned")}
        />
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("volume.manageVolumesTitle")}</DialogTitle>
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
            multiline
            rows={4}
            variant="outlined"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            placeholder={t("volume.e.gVolumes")}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {loading ? t("common.saving") : t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VolumeManager;

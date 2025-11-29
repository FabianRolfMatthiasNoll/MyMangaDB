import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  alpha,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Manga, Volume } from "../api/models";
import { useUser } from "../context/UserContext";
import { updateMangaDetails } from "../services/mangaService";

interface VolumeManagerProps {
  manga: Manga;
  onUpdate: () => void;
}

const VolumeManager: React.FC<VolumeManagerProps> = ({ manga, onUpdate }) => {
  const theme = useTheme();
  const { isAdmin } = useUser();
  const [open, setOpen] = useState(false);
  const [inputString, setInputString] = useState("");
  const [loading, setLoading] = useState(false);

  // Calculate owned volumes and max volume
  const ownedVolumes = new Set(
    manga.volumes
      .map((v) => parseInt(v.volumeNumber, 10))
      .filter((n) => !isNaN(n))
  );
  const maxVolume =
    ownedVolumes.size > 0 ? Math.max(...Array.from(ownedVolumes)) : 0;

  // Generate display array (1 to maxVolume)
  // If no volumes, show nothing or maybe a placeholder
  const displayVolumes = Array.from({ length: maxVolume }, (_, i) => i + 1);

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
  }, [open, manga.volumes]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Parse input string
      const newOwnedVolumes = new Set<number>();
      const parts = inputString
        .split(/[;,]+/)
        .map((s) => s.trim())
        .filter((s) => s);

      parts.forEach((part) => {
        if (part.includes("-")) {
          const [startStr, endStr] = part.split("-");
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = start; i <= end; i++) {
              newOwnedVolumes.add(i);
            }
          }
        } else {
          const num = parseInt(part, 10);
          if (!isNaN(num)) {
            newOwnedVolumes.add(num);
          }
        }
      });

      // Create new Volume objects
      const newVolumes: Volume[] = Array.from(newOwnedVolumes).map((num) => ({
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
      alert("Failed to update volumes");
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
          Volumes ({ownedVolumes.size} Owned)
        </Typography>
        {isAdmin && (
          <Button
            startIcon={<EditIcon />}
            variant="outlined"
            size="small"
            onClick={() => setOpen(true)}
          >
            Manage Volumes
          </Button>
        )}
      </Box>

      {displayVolumes.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No volumes tracked yet.
        </Typography>
      ) : (
        <Grid container spacing={1}>
          {displayVolumes.map((volNum) => {
            const isOwned = ownedVolumes.has(volNum);
            return (
              <Grid item key={volNum}>
                <Tooltip title={isOwned ? "Owned" : "Not Owned"}>
                  <Paper
                    elevation={isOwned ? 2 : 0}
                    sx={{
                      width: 40,
                      height: 40,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 1,
                      bgcolor: isOwned
                        ? theme.palette.primary.main
                        : alpha(theme.palette.action.disabledBackground, 0.3),
                      color: isOwned
                        ? theme.palette.primary.contrastText
                        : theme.palette.text.disabled,
                      fontWeight: "bold",
                      border: isOwned
                        ? "none"
                        : `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {volNum}
                  </Paper>
                </Tooltip>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Manage Volumes</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter volumes you own. You can use ranges (e.g., "1-10") and
            separate with semicolons or commas (e.g., "1-10; 15; 20").
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="volumes"
            label="Volumes"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            placeholder="e.g. 1-10; 12; 15-20"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VolumeManager;

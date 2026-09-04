import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "react-i18next";

import { Manga, Volume } from "../../api/models";
import { useUser } from "../../context/UserContext";
import { updateMangaDetails } from "../../services/mangaService";
import { parseVolumeString } from "../../utils/volumeUtils";
import VolumeDrawer from "./VolumeDrawer";
import VolumeSpine from "./VolumeSpine";

interface VolumeShelfProps {
  manga: Manga;
  /** Called after a successful bulk volume-set edit or a per-volume cover change. */
  onChanged?: () => void;
  /** Called when a per-volume cover change fails (drawer surfaces the snackbar). */
  onError?: (message: string) => void;
}

// Layout constants — kept in sync with VolumeSpine's default sizes. The
// spine is 40px wide on md+ (30px on mobile), 150px tall (120px on mobile),
// and the gap between spines on the shelf is 6px.
const SPINE_WIDTH_DESKTOP = 40;
const SPINE_WIDTH_MOBILE = 30;
const SHELF_PADDING_X = 32; // px on each side (left+right)
const SHELF_PADDING_X_MOBILE = 24;
const SHELF_GAP = 6;

/**
 * Tracks the rendered width of an element via a ResizeObserver. The hook
 * keeps a sensible default width on first render so the initial layout
 * doesn't show one giant row of all the spines before the observer fires.
 */
const useElementWidth = (fallback: number) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, width] as const;
};

const VolumeShelf: React.FC<VolumeShelfProps> = ({
  manga,
  onChanged,
  onError,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isAdmin } = useUser();
  const [manageOpen, setManageOpen] = useState(false);
  const [manageInput, setManageInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState<Volume | null>(null);

  // Container ref + measured width so we can chunk spines into rows whose
  // count matches whatever horizontal space the user has.
  const [containerRef, containerWidth] = useElementWidth(1200);

  const ownedNumbers = useMemo(
    () =>
      new Set(
        manga.volumes
          .map((v) => parseInt(v.volumeNumber, 10))
          .filter((n) => !Number.isNaN(n))
      ),
    [manga.volumes]
  );

  const maxVolume = useMemo(() => {
    if (ownedNumbers.size === 0) return 0;
    return Math.max(...Array.from(ownedNumbers));
  }, [ownedNumbers]);

  const displayVolumes = useMemo<Volume[]>(() => {
    const exactMap = new Map<string, Volume>();
    for (const v of manga.volumes) {
      if (!exactMap.has(v.volumeNumber)) {
        exactMap.set(v.volumeNumber, v);
      }
    }

    const integerVolumes: Volume[] = [];
    for (let n = 1; n <= maxVolume; n++) {
      const key = String(n);
      const existing = exactMap.get(key);
      integerVolumes.push(
        existing ?? {
          id: 0,
          mangaId: manga.id,
          volumeNumber: key,
          coverImage: null,
        }
      );
    }

    const nonIntegerVolumes = manga.volumes
      .filter((v) => {
        const n = parseInt(v.volumeNumber, 10);
        return Number.isNaN(n) || n < 1 || n > maxVolume;
      })
      .sort((a, b) => a.volumeNumber.localeCompare(b.volumeNumber));

    return [...integerVolumes, ...nonIntegerVolumes];
  }, [manga.volumes, manga.id, maxVolume]);

  // When the manage-volumes dialog opens, prefill with the canonical range
  // representation of the current owned set.
  useEffect(() => {
    if (!manageOpen) return;
    const sorted = Array.from(ownedNumbers).sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sorted[0];
    let prev = sorted[0];
    for (let i = 1; i <= sorted.length; i++) {
      const current = sorted[i];
      if (current === prev + 1) {
        prev = current;
      } else {
        ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
        start = current;
        prev = current;
      }
    }
    setManageInput(ranges.join("; "));
  }, [manageOpen, ownedNumbers]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const newOwned = parseVolumeString(manageInput);
      const newVolumes: Volume[] = newOwned.map((num) => ({
        id: 0,
        mangaId: manga.id,
        volumeNumber: num.toString(),
        coverImage: null,
      }));
      await updateMangaDetails({ ...manga, volumes: newVolumes });
      onChanged?.();
      setManageOpen(false);
    } catch (error) {
      console.error("Failed to update volumes", error);
      onError?.(t("volume.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const isDark = theme.palette.mode === "dark";

  // ---- Wood-grain "back wall" + plank for each shelf ----
  const shelfBack = isDark
    ? `
        repeating-linear-gradient(
          90deg,
          transparent 0,
          transparent 12px,
          rgba(0,0,0,0.22) 12px,
          rgba(0,0,0,0.22) 13px
        ),
        repeating-linear-gradient(
          0deg,
          transparent 0,
          transparent 44px,
          rgba(255,255,255,0.04) 44px,
          rgba(255,255,255,0.04) 46px
        ),
        linear-gradient(180deg, #2b1d10 0%, #1a1208 100%)`
    : `
        repeating-linear-gradient(
          90deg,
          transparent 0,
          transparent 12px,
          rgba(40, 18, 6, 0.22) 12px,
          rgba(40, 18, 6, 0.22) 13px
        ),
        repeating-linear-gradient(
          0deg,
          transparent 0,
          transparent 44px,
          rgba(255,255,255,0.04) 44px,
          rgba(255,255,255,0.04) 46px
        ),
        linear-gradient(180deg, #6b4a2b 0%, #4a2810 100%)`;

  const plankBg = isDark
    ? `
        repeating-linear-gradient(
          90deg,
          transparent 0,
          transparent 16px,
          rgba(0,0,0,0.28) 16px,
          rgba(0,0,0,0.28) 17px
        ),
        linear-gradient(180deg, #3a2515 0%, #1f140a 100%)`
    : `
        repeating-linear-gradient(
          90deg,
          transparent 0,
          transparent 16px,
          rgba(0,0,0,0.28) 16px,
          rgba(0,0,0,0.28) 17px
        ),
        linear-gradient(180deg, #8b5a2b 0%, #5e3a1a 100%)`;

  const plankShadow = isDark
    ? "0 8px 18px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.4)"
    : "0 8px 18px rgba(40,18,6,0.5), 0 2px 4px rgba(40,18,6,0.35)";

  // Compute spines-per-row from the measured container width. We pick
  // desktop vs mobile constants based on a simple viewport heuristic.
  const isWide = containerWidth >= 600;
  const spineW = isWide ? SPINE_WIDTH_DESKTOP : SPINE_WIDTH_MOBILE;
  const padX = isWide ? SHELF_PADDING_X : SHELF_PADDING_X_MOBILE;
  const usable = Math.max(0, containerWidth - padX * 2);
  const spinesPerRow = Math.max(1, Math.floor((usable + SHELF_GAP) / (spineW + SHELF_GAP)));

  const rows = useMemo(() => {
    const r: Volume[][] = [];
    for (let i = 0; i < displayVolumes.length; i += spinesPerRow) {
      r.push(displayVolumes.slice(i, i + spinesPerRow));
    }
    return r;
  }, [displayVolumes, spinesPerRow]);

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
          {t("volume.volumesOwned", { count: ownedNumbers.size })}
        </Typography>
        {isAdmin && (
          <Button
            startIcon={<EditIcon />}
            variant="outlined"
            size="small"
            onClick={() => setManageOpen(true)}
          >
            {t("volume.manageVolumesTitle")}
          </Button>
        )}
      </Box>

      {/* Hidden-width element used to measure the container. The rendered
          shelves mirror its width via the same `width: 100%`. */}
      <Box ref={containerRef} sx={{ width: "100%" }}>
        {displayVolumes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t("volume.noVolumesTracked")}
          </Typography>
        ) : (
          rows.map((row, rowIdx) => (
            <Box key={rowIdx} sx={{ mb: rowIdx === rows.length - 1 ? 0 : 3.5 }}>
              {/* Wood backing of the shelf — spines stand inside this. */}
              <Box
                sx={{
                  background: shelfBack,
                  borderRadius: "6px 6px 0 0",
                  px: `${padX / 8}px`,
                  pt: 3,
                  pb: 1,
                  // Inner top shadow so the wood recedes behind the books.
                  boxShadow:
                    "inset 0 4px 8px -4px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(0,0,0,0.3)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: `${SHELF_GAP}px`,
                    minHeight: 160,
                    flexWrap: "nowrap",
                    justifyContent:
                      row.length < spinesPerRow ? "flex-start" : "space-between",
                  }}
                >
                  {row.map((vol) => (
                    <VolumeSpine
                      key={`${vol.id || "tmp"}-${vol.volumeNumber}`}
                      volume={vol}
                      isOwned={ownedNumbers.has(
                        parseInt(vol.volumeNumber, 10)
                      )}
                      onClick={() => setSelectedVolume(vol)}
                    />
                  ))}
                </Box>
              </Box>
              {/* Wood plank under the shelf. */}
              <Box
                sx={{
                  height: 16,
                  mt: "-2px",
                  background: plankBg,
                  borderRadius: "0 0 6px 6px",
                  boxShadow: plankShadow,
                }}
              />
            </Box>
          ))
        )}
      </Box>

      <Dialog
        open={manageOpen}
        onClose={() => setManageOpen(false)}
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
            value={manageInput}
            onChange={(e) => setManageInput(e.target.value)}
            placeholder={t("volume.e.gVolumes")}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>

      <VolumeDrawer
        mangaId={manga.id}
        volume={selectedVolume}
        isOwned={
          !!selectedVolume &&
          ownedNumbers.has(parseInt(selectedVolume.volumeNumber, 10))
        }
        open={!!selectedVolume}
        onClose={() => setSelectedVolume(null)}
        onChanged={onChanged}
        onError={onError}
      />
    </Box>
  );
};

export default VolumeShelf;

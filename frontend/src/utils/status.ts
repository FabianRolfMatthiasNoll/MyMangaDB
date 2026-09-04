import type { Theme } from "@mui/material/styles";

/**
 * Single source of truth for mapping manga reading/overall status values to a
 * MUI palette key. Supports both lowercase enum values (the canonical wire
 * format from `ReadingStatus` / `OverallStatus`) AND legacy capitalised
 * strings still present in older data, so we render either form correctly
 * during the migration period.
 */
type PaletteKey =
  | "error"
  | "warning"
  | "info"
  | "success"
  | "secondary"
  | "grey";

const STATUS_PALETTE: Record<string, PaletteKey> = {
  // Reading status (lowercase enum values)
  not_started: "error",
  in_progress: "info",
  completed: "success",
  on_hold: "warning",
  dropped: "error",

  // Overall status
  ongoing: "info",
  hiatus: "warning",
  cancelled: "error",

  // Legacy capitalised strings (pre-refactor data)
  "Not Started": "error",
  Reading: "info",
  Completed: "success",
  "On Hold": "warning",
  Dropped: "error",
  "Plan to Read": "secondary",
  Ongoing: "info",
  Hiatus: "warning",
  Discontinued: "error",
};

export const getStatusColor = (
  status: string | null | undefined,
  theme: Theme
): string => {
  if (!status) {
    return theme.palette.grey[500];
  }
  const key: PaletteKey = STATUS_PALETTE[status] ?? "grey";
  const slot = theme.palette[key];
  // `secondary/error/info/...` expose `PaletteColor` with a `.main`; `grey`
  // exposes `Color` with numeric index access (`grey[500]`). Resolve both
  // shapes to a concrete color string.
  if (typeof slot === "string") {
    return slot;
  }
  if ("main" in slot && typeof slot.main === "string") {
    return slot.main;
  }
  // Fallback for `grey` etc.: pick a mid-tone.
  return theme.palette.grey[500];
};

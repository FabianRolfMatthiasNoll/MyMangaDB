import { Chip, useTheme } from "@mui/material";

import { getStatusColor } from "../utils/status";

interface MangaStatusChipProps {
  status?: string | null;
  size?: "small" | "medium";
}

/**
 * Renders a status chip with the standard colour palette. Used in place of
 * the duplicated `getStatusColor` colour maps that previously lived in
 * MangaCard / MobileMangaListItem / MangaDetails.
 *
 * Returns `null` when no status is provided so callers can render it
 * unconditionally without `&&` checks.
 */
const MangaStatusChip: React.FC<MangaStatusChipProps> = ({
  status,
  size = "small",
}) => {
  const theme = useTheme();

  if (!status) {
    return null;
  }

  return (
    <Chip
      label={status}
      size={size}
      sx={{
        bgcolor: getStatusColor(status, theme),
        color: "common.white",
        fontWeight: 500,
      }}
    />
  );
};

export default MangaStatusChip;

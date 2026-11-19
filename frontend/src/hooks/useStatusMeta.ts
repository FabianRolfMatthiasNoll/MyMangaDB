import { useTheme } from "@mui/material";
import { PaletteColor } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { OverallStatus, ReadingStatus } from "../api/models";

/**
 * Metadata for a status value: the translation key for its label and the
 * palette key used to colour its chip.
 */
interface StatusMeta {
  labelKey: string;
  color: "error" | "info" | "success" | "warning" | "secondary";
}

/**
 * The backend returns the raw enum *values* (`not_started`, `in_progress`,
 * `cancelled`, ...) - not the display strings. Looking those values up in a
 * table keyed by display strings silently misses, which is why every status
 * chip used to render in the fallback grey.
 */
const READING_STATUS_META: Record<string, StatusMeta> = {
  [ReadingStatus.NotStarted]: { labelKey: "status.notStarted", color: "secondary" },
  [ReadingStatus.InProgress]: { labelKey: "status.reading", color: "info" },
  [ReadingStatus.Completed]: { labelKey: "status.completed", color: "success" },
  [ReadingStatus.OnHold]: { labelKey: "status.onHold", color: "warning" },
  [ReadingStatus.Dropped]: { labelKey: "status.dropped", color: "error" },
};

const OVERALL_STATUS_META: Record<string, StatusMeta> = {
  [OverallStatus.Ongoing]: { labelKey: "status.ongoing", color: "info" },
  [OverallStatus.Completed]: { labelKey: "status.completed", color: "success" },
  [OverallStatus.Hiatus]: { labelKey: "status.hiatus", color: "warning" },
  [OverallStatus.Cancelled]: { labelKey: "status.cancelled", color: "error" },
};

const findMeta = (status?: string | null): StatusMeta | undefined => {
  if (!status) {
    return undefined;
  }
  return READING_STATUS_META[status] ?? OVERALL_STATUS_META[status];
};

/**
 * Shared helpers for rendering a reading/overall status: a translated label
 * and the matching theme colour.
 *
 * Both the reading status and the overall status enum are looked up, because
 * a status chip does not know which of the two it is rendering.
 */
export const useStatusMeta = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  /** Translated label for a status value, or the raw value as a fallback. */
  const getStatusLabel = (status?: string | null): string => {
    if (!status) {
      return "";
    }
    const meta = findMeta(status);
    return meta ? t(meta.labelKey) : status;
  };

  /** Theme colour for a status value; grey when the status is unknown. */
  const getStatusColor = (status?: string | null): string => {
    const meta = findMeta(status);
    if (!meta) {
      return theme.palette.grey[500];
    }
    return (theme.palette[meta.color] as PaletteColor).main;
  };

  /** Translation key for a status value, or undefined when unknown. */
  const getStatusLabelKey = (status?: string | null): string | undefined =>
    findMeta(status)?.labelKey;

  return { getStatusLabel, getStatusColor, getStatusLabelKey };
};

export default useStatusMeta;

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Paper,
  Tooltip,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";

interface VolumeStripProps {
  /** The volumes of the series, in order. */
  volumes: number[];
  /** The volumes that are filled in. */
  filled: Set<number>;
  /** What a filled slot means, e.g. "Owned". */
  filledLabel: string;
  /** What an empty slot means, e.g. "Missing". */
  emptyLabel: string;
  /**
   * Which colour the filled slots use. "primary" for volumes you have,
   * "secondary" for the ones you are still missing.
   */
  color?: "primary" | "secondary";
  /** How many volumes to render at most. */
  max?: number;
}

/**
 * A row of small squares, one per volume of a series.
 *
 * A filled square always means the same thing everywhere: the volume is in
 * the collection. The empty ones are the ones that are still wanted. The
 * tooltip says which is which, and the legend below the row repeats it -
 * without a legend the same square reads as "complete" on one page and
 * "missing everything" on the other.
 */
const VolumeStrip: React.FC<VolumeStripProps> = ({
  volumes,
  filled,
  filledLabel,
  emptyLabel,
  color = "primary",
  max = 40,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const visible = volumes.slice(0, max);
  const hidden = volumes.length - visible.length;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          flexWrap: "wrap",
        }}
      >
        {visible.map((volume) => {
          const isFilled = filled.has(volume);
          return (
            <Tooltip key={volume} title={isFilled ? filledLabel : emptyLabel}>
              <Paper
                elevation={isFilled ? 2 : 0}
                sx={{
                  width: 28,
                  height: 28,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 1,
                  bgcolor: isFilled
                    ? theme.palette[color].main
                    : alpha(theme.palette.action.disabledBackground, 0.3),
                  color: isFilled
                    ? theme.palette[color].contrastText
                    : theme.palette.text.disabled,
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  border: isFilled
                    ? "none"
                    : `1px solid ${theme.palette.divider}`,
                }}
              >
                {volume}
              </Paper>
            </Tooltip>
          );
        })}
        {hidden > 0 && (
          <Tooltip title={t("volume.moreVolumes", { count: hidden })}>
            <Typography variant="caption" color="text.secondary">
              {`+${hidden}`}
            </Typography>
          </Tooltip>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          mt: 0.5,
          alignItems: "center",
        }}
      >
        <LegendEntry
          label={filledLabel}
          filled
          color={theme.palette[color].main}
        />
        <LegendEntry
          label={emptyLabel}
          filled={false}
          color={alpha(theme.palette.action.disabledBackground, 0.3)}
        />
      </Box>
    </Box>
  );
};

/** One entry of the legend below the volume strip. */
const LegendEntry = ({
  label,
  filled,
  color,
}: {
  label: string;
  filled: boolean;
  color: string;
}) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
    <Paper
      elevation={0}
      sx={{
        width: 10,
        height: 10,
        borderRadius: 0.5,
        bgcolor: color,
        border: filled ? "none" : `1px solid ${alpha("#000", 0.2)}`,
      }}
    />
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export default VolumeStrip;

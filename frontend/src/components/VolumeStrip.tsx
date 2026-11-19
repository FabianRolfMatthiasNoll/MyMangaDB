import React from "react";
import { Box, Paper, Tooltip, Typography, useTheme, alpha } from "@mui/material";

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
 * The filled ones are the volumes that matter for the current view - the
 * ones you own on the manga page, the ones you are still missing on the
 * wishlist. Both use this component so the two pages look the same.
 */
const VolumeStrip: React.FC<VolumeStripProps> = ({
  volumes,
  filled,
  filledLabel,
  emptyLabel,
  color = "primary",
  max = 40,
}) => {
  const theme = useTheme();

  const visible = volumes.slice(0, max);
  const hidden = volumes.length - visible.length;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
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
        <Typography variant="caption" color="text.secondary">
          {`+${hidden}`}
        </Typography>
      )}
    </Box>
  );
};

export default VolumeStrip;

import React from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";

import { Volume } from "../../api/models";
import { getVolumeCoverImageUrl } from "../../services/volumeImageService";

interface VolumeSpineProps {
  volume: Volume;
  isOwned: boolean;
  onClick?: () => void;
}

/**
 * A single book on the shelf. Plain CSS hover lifts it slightly; no
 * rotation, no scaling, no framer-motion. The cover image fills the spine
 * and the volume number is typeset vertically at the bottom like a real
 * book. On touch devices the hover is suppressed via media query so the
 * layout stays put.
 */
const VolumeSpine: React.FC<VolumeSpineProps> = ({
  volume,
  isOwned,
  onClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isHoverCapable = useMediaQuery("(hover: hover) and (pointer: fine)");

  const width = isMobile ? 30 : 40;
  const height = isMobile ? 120 : 150;

  const coverUrl = volume.coverImage
    ? getVolumeCoverImageUrl(volume.coverImage)
    : "";

  // Spine edge shading — dark on both sides, mimicking the curved spine
  // surface of a bound book. The cover image (if any) fills the centre.
  const spineOverlay = isOwned
    ? `linear-gradient(90deg,
        rgba(0,0,0,0.55) 0%,
        rgba(0,0,0,0.18) 7%,
        rgba(0,0,0,0)    22%,
        rgba(0,0,0,0)    78%,
        rgba(0,0,0,0.18) 93%,
        rgba(0,0,0,0.55) 100%)`
    : "transparent";

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={`Volume ${volume.volumeNumber}${isOwned ? " (owned)" : ""}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      sx={{
        position: "relative",
        width,
        height,
        flexShrink: 0,
        cursor: "pointer",
        borderRadius: "2px 4px 4px 2px",
        // Edge shading + (when owned) the cover image as background fill.
        background:
          coverUrl && isOwned
            ? `${spineOverlay}, url(${coverUrl}) center / cover`
            : spineOverlay,
        boxShadow: isOwned
          ? "0 4px 6px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(0,0,0,0.35)"
          : "none",
        outline: !isOwned
          ? `1px dashed ${theme.palette.text.disabled}`
          : "none",
        outlineOffset: -1,
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        ...(isHoverCapable && {
          "@media (hover: hover)": {
            "&:hover": {
              transform: "translateY(-12px)",
              boxShadow:
                "0 18px 28px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(0,0,0,0.3)",
            },
          },
        }),
      }}
    >
      {/* Top highlight — light catching the top edge of the book. */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "14%",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Bottom shadow — book meeting the plank. */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "30%",
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Missing-volume label, centred in the spine. */}
      {!isOwned && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              color: "text.disabled",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 0.5,
              opacity: 0.7,
              writingMode: "vertical-rl",
            }}
          >
            ?
          </Box>
        </Box>
      )}

      {/* Volume number at the BOTTOM of the spine, vertically typeset so
          you read it by tilting your head right (standard book spine). */}
      <Box
        sx={{
          position: "absolute",
          bottom: 4,
          left: 0,
          right: 0,
          height: "45%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            writingMode: "vertical-rl",
            color: "#fff",
            fontSize: isMobile ? 10 : 12,
            fontWeight: 700,
            letterSpacing: 0.5,
            textShadow:
              "0 1px 2px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.6)",
            pb: 0.5,
          }}
        >
          {volume.volumeNumber}
        </Box>
      </Box>
    </Box>
  );
};

export default VolumeSpine;

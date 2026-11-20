import { useTheme } from "@mui/material";
import { PaletteColor } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { OwnershipStatus } from "../api/models";

/** The palette entry a state is drawn with. */
export type OwnershipColorKey = "primary" | "secondary" | "warning";

/**
 * The ownership state says whether a title is part of the collection or only
 * wanted - independently of how far it has been read.
 */
const OWNERSHIP_LABEL_KEYS: Record<string, string> = {
  [OwnershipStatus.Owned]: "ownership.owned",
  [OwnershipStatus.Wishlist]: "ownership.wishlist",
  [OwnershipStatus.Ordered]: "ownership.ordered",
};

const OWNERSHIP_COLOR_KEYS: Record<string, OwnershipColorKey> = {
  [OwnershipStatus.Owned]: "primary",
  [OwnershipStatus.Wishlist]: "secondary",
  [OwnershipStatus.Ordered]: "warning",
};

/**
 * Shared helpers for rendering the ownership state: a translated label and
 * the matching theme colour.
 */
export const useOwnershipStatus = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  /** Translated label for an ownership state; "Owned" when it is unknown. */
  const getOwnershipLabel = (status?: OwnershipStatus | null): string => {
    const key = status ? OWNERSHIP_LABEL_KEYS[status] : undefined;
    return key ? t(key) : t("ownership.owned");
  };

  /** Theme colour for an ownership state. */
  const getOwnershipColor = (status?: OwnershipStatus | null): string => {
    const key = (status && OWNERSHIP_COLOR_KEYS[status]) || "primary";
    return (theme.palette[key] as PaletteColor).main;
  };

  return { getOwnershipLabel, getOwnershipColor };
};

export default useOwnershipStatus;

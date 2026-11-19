import { useTranslation } from "react-i18next";

/**
 * Translated label for a manga category.
 *
 * The backend returns the raw enum value (`manga`, `novel`, `doujinshi`),
 * so the label has to be looked up. Unknown values fall back to the raw
 * value instead of showing a missing translation key.
 */
export const useCategoryLabel = () => {
  const { t } = useTranslation();

  return (category?: string | null): string => {
    if (!category) {
      return "";
    }
    const key = `categories.${category}`;
    const translated = t(key);
    return translated === key ? category : translated;
  };
};

export default useCategoryLabel;

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "showWishlistInDashboard";

/**
 * Whether the collection shows the titles that are only on the wishlist.
 *
 * The Dashboard is the collection - a title you do not own yet does not
 * belong there. The setting is remembered, so it is a preference rather
 * than something to re-tick on every visit.
 */
export const useShowWishlistInDashboard = () => {
  const [showWishlist, setShowWishlist] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true"
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(showWishlist));
  }, [showWishlist]);

  const toggle = useCallback(() => {
    setShowWishlist((previous) => !previous);
  }, []);

  return { showWishlist, setShowWishlist, toggle };
};

export default useShowWishlistInDashboard;

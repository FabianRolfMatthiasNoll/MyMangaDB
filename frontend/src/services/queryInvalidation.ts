import { QueryClient } from "@tanstack/react-query";

/**
 * Refresh everything that shows mangas.
 *
 * The wishlist badge in the header and the wishlist page share the
 * "wishlist" query. The header stays mounted for the whole session, so
 * without an invalidation the badge keeps the count it had when the app
 * was loaded - a title that was just added to the wishlist only showed up
 * after a reload of the page.
 */
export const invalidateMangaQueries = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["mangas"] }),
    queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
    queryClient.invalidateQueries({ queryKey: ["lists"] }),
  ]);
};

export default invalidateMangaQueries;

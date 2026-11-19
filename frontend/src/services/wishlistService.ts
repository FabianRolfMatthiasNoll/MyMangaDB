import { Manga, OwnershipStatus } from "../api/models";
import { getMangas } from "./mangaService";

/** The API returns at most 100 entries per page. */
const PAGE_SIZE = 100;

/**
 * Every title that is wanted or on the way.
 *
 * The collection is fetched page by page, so a wishlist longer than one
 * page is not cut off.
 */
export const getWishlistMangas = async (): Promise<Manga[]> => {
  const results: Manga[] = [];

  for (let page = 1; ; page += 1) {
    const batch = await getMangas({
      page,
      limit: PAGE_SIZE,
      ownershipStatuses: [OwnershipStatus.Wishlist, OwnershipStatus.Ordered],
    });

    results.push(...batch);

    if (batch.length < PAGE_SIZE) {
      return results;
    }
  }
};

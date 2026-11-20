import { Manga, OwnershipStatus, Volume } from "../api/models";
import { deleteManga, getMangas, updateMangaDetails } from "./mangaService";
import { missingVolumesOf } from "../utils/wishlist";

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

/**
 * Move a title to another ownership state - owned, wishlist or ordered.
 */
export const setOwnershipStatus = async (
  manga: Manga,
  ownershipStatus: OwnershipStatus
): Promise<Manga> => {
  const updated = await updateMangaDetails({ ...manga, ownershipStatus });
  if (!updated) {
    throw new Error("The manga could not be updated");
  }
  return updated;
};

/**
 * Flag a title as prioritised - or clear the flag.
 */
export const setPriority = async (
  manga: Manga,
  priority: boolean
): Promise<Manga> => {
  const updated = await updateMangaDetails({ ...manga, priority });
  if (!updated) {
    throw new Error("The manga could not be updated");
  }
  return updated;
};

/**
 * Buy the rest of a series: the missing volumes are added and the title
 * moves into the collection.
 */
export const completeSeries = async (manga: Manga): Promise<Manga> => {
  const missing = missingVolumesOf(manga);
  const newVolumes: Volume[] = missing.map((volumeNumber) => ({
    id: 0,
    mangaId: manga.id,
    volumeNumber: String(volumeNumber),
    coverImage: null,
  }));

  const updated = await updateMangaDetails({
    ...manga,
    ownershipStatus: OwnershipStatus.Owned,
    volumes: [...manga.volumes, ...newVolumes],
  });
  if (!updated) {
    throw new Error("The manga could not be updated");
  }
  return updated;
};

/**
 * Drop a title from the wishlist for good.
 */
export const removeFromWishlist = async (manga: Manga): Promise<void> => {
  await deleteManga(manga.id);
};

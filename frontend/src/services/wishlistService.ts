import { Manga, OwnershipStatus, Volume } from "../api/models";
import { deleteManga, getMangas, updateMangaDetails } from "./mangaService";
import { missingVolumesOf, ownedVolumesOf } from "../utils/wishlist";

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
  ownershipStatus: OwnershipStatus,
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
  priority: boolean,
): Promise<Manga> => {
  const updated = await updateMangaDetails({ ...manga, priority });
  if (!updated) {
    throw new Error("The manga could not be updated");
  }
  return updated;
};

/**
 * Move some of the wanted volumes into the collection.
 *
 * The title stays on the wishlist - only the volumes that were received
 * move. When the last missing volume is filled, the title is complete and
 * leaves the wishlist.
 */
export const addVolumesToCollection = async (
  manga: Manga,
  volumeNumbers: number[],
): Promise<Manga> => {
  const owned = new Set(ownedVolumesOf(manga));
  const received = volumeNumbers.filter(
    (number) => !owned.has(number) && number > 0,
  );

  if (received.length === 0) {
    return manga;
  }

  const volumes: Volume[] = [
    ...manga.volumes,
    ...received.map((number) => ({
      id: 0,
      mangaId: manga.id,
      volumeNumber: number.toString(),
      coverImage: null,
    })),
  ];

  // The series is complete when every volume up to the total is on the
  // shelf. Without a known total the app cannot tell - the title then stays
  // on the wishlist until it is marked as owned by hand.
  const complete =
    manga.totalVolumes !== null &&
    manga.totalVolumes !== undefined &&
    missingVolumesOf({ ...manga, volumes }).length === 0;

  const updated = await updateMangaDetails({
    ...manga,
    ownershipStatus: complete ? OwnershipStatus.Owned : manga.ownershipStatus,
    volumes,
  });
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
 *
 * Returns the deleted title, or null when the request failed.
 */
export const removeFromWishlist = async (manga: Manga): Promise<Manga | null> =>
  deleteManga(manga.id);

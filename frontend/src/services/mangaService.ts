import { Manga, MangaCreate } from "../api";
import { MangasApi } from "../api/apis";
import { configuration } from "./config";
import { apiCallWrapper, apiCallWrapperOrThrow, handleApiError } from "./errorService";
import { saveMangaCover } from "./imageService";

const mangasApi = new MangasApi(configuration);

/** The filters and paging the manga collection can be queried with. */
export interface MangaQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  categories?: string[];
  readingStatuses?: string[];
  overallStatuses?: string[];
  ratingMin?: number;
  ratingMax?: number;
  listId?: number;
  ownershipStatuses?: string[];
  /** Leave out the titles that are only wanted. */
  hidePureWishes?: boolean;
}

export const getMangas = async ({
  page = 1,
  limit = 20,
  search,
  sort,
  categories,
  readingStatuses,
  overallStatuses,
  ratingMin,
  ratingMax,
  listId,
  ownershipStatuses,
  hidePureWishes,
}: MangaQuery = {}) =>
  apiCallWrapperOrThrow(() =>
    mangasApi.getMangasApiV1MangasGetAllGet({
      skip: (page - 1) * limit,
      limit,
      search: search || undefined,
      sort: sort || undefined,
      categories: categories?.length ? categories : undefined,
      readingStatuses: readingStatuses?.length ? readingStatuses : undefined,
      overallStatuses: overallStatuses?.length ? overallStatuses : undefined,
      ratingMin: ratingMin !== undefined ? ratingMin : undefined,
      ratingMax: ratingMax !== undefined ? ratingMax : undefined,
      listId: listId !== undefined ? listId : undefined,
      ownershipStatuses: ownershipStatuses?.length ? ownershipStatuses : undefined,
      hidePureWishes: hidePureWishes !== undefined ? hidePureWishes : undefined,
    })
  );

export const getMangaDetails = async (mangaId: number) =>
  apiCallWrapperOrThrow(() =>
    mangasApi.getMangaByIdApiV1MangasMangaIdGet({
      mangaId,
    })
  );

export const deleteManga = async (mangaId: number) =>
  apiCallWrapper(
    () =>
      mangasApi.deleteMangaApiV1MangasMangaIdDelete({
        mangaId,
      }),
    null,
  );

export const updateMangaDetails = async (manga: Manga, coverImage?: File) => {
  try {
    let coverImagePath = manga.coverImage;
    if (coverImage) {
      const uniqueFilename = `${crypto.randomUUID()}.jpg`;
      coverImagePath = await saveMangaCover(coverImage, uniqueFilename);
    }

    const mangaToUpdate = {
      ...manga,
      coverImage: coverImagePath,
    };

    return await apiCallWrapper(
      () => mangasApi.updateMangaApiV1MangasUpdatePut({ manga: mangaToUpdate }),
      null,
    );
  } catch (error) {
    console.error("Error updating manga:", error);
    throw error;
  }
};

export const createManga = async (mangaCreate: MangaCreate) => {
  try {
    return await mangasApi.createMangaApiV1MangasCreatePost({ mangaCreate });
  } catch (error) {
    await handleApiError(error);
    throw error; // Re-throw so caller knows it failed
  }
};

export const getMangasByListId = async (listId: number) =>
  apiCallWrapper(
    () =>
      mangasApi.getMangasByListApiV1MangasByListListIdGet({
        listId,
      }),
    [],
  );

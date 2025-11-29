import { Manga, MangaCreate } from "../api";
import { MangasApi } from "../api/apis";
import { configuration } from "./config";
import { apiCallWrapper } from "./errorService";
import { saveMangaCover } from "./imageService";

const mangasApi = new MangasApi(configuration);

export const getMangas = async (
  page: number,
  limit: number,
  search?: string,
  sort?: string
) =>
  apiCallWrapper(
    () =>
      mangasApi.getMangasApiV1MangasGetAllGet({
        skip: (page - 1) * limit,
        limit,
        search: search || undefined,
        sort: sort || undefined,
      }),
    []
  );

export const getMangaDetails = async (mangaId: number) =>
  apiCallWrapper(
    () =>
      mangasApi.getMangaByIdApiV1MangasMangaIdGet({
        mangaId,
      }),
    null
  );

export const deleteManga = async (mangaId: number) =>
  apiCallWrapper(
    () =>
      mangasApi.deleteMangaApiV1MangasMangaIdDelete({
        mangaId,
      }),
    null
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
      coverImage: coverImagePath
    };

    return await apiCallWrapper(
      () => mangasApi.updateMangaApiV1MangasUpdatePut({ manga: mangaToUpdate }),
      null
    );
  } catch (error) {
    console.error("Error updating manga:", error);
    throw error;
  }
};

export const createManga = async (mangaCreate: MangaCreate) =>
  apiCallWrapper(
    () => mangasApi.createMangaApiV1MangasCreatePost({ mangaCreate }),
    null
  );

export const getMangasByListId = async (listId: number) =>
  apiCallWrapper(
    () =>
      mangasApi.getMangasByListApiV1MangasByListListIdGet({
        listId,
      }),
    []
  );

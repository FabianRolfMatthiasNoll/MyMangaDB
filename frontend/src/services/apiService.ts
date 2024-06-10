import { ListModel, Manga, MangaCreate } from "../api";
import {
  AuthorsApi,
  GenresApi,
  MangasApi,
  SourcesApi,
  ListsApi,
} from "../api/apis";
import { Configuration, ConfigurationParameters } from "../api/runtime";

const configurationParams: ConfigurationParameters = {
  basePath: "http://localhost:8000",
};
const configuration = new Configuration(configurationParams);

const mangasApi = new MangasApi(configuration);
const authorApi = new AuthorsApi(configuration);
const genresApi = new GenresApi(configuration);
const sourcesApi = new SourcesApi(configuration);
const listsApi = new ListsApi(configuration);

export const getMangas = async (page: number, limit: number) => {
  const response = await mangasApi.getMangasApiV1MangasGetAllGet({
    skip: (page - 1) * limit,
    limit,
  });
  return response;
};

export const getMangaCoverImageUrl = (filepath: string) => {
  return `http://localhost:8000/api/v1/images/manga/${filepath}`;
};

export const getMangaDetails = async (mangaId: number) => {
  const response = await mangasApi.getMangaByIdApiV1MangasMangaIdGet({
    mangaId,
  });
  return response;
};

export const getMangasByListId = async (listId: number) => {
  const response = await mangasApi.getMangasByListApiV1MangasByListListIdGet({
    listId,
  });
  return response;
};

export const updateMangaDetails = async (manga: Manga) => {
  const response = await mangasApi.updateMangaApiV1MangasUpdatePut({
    manga: manga,
  });
  return response;
};

export const createManga = async (mangaCreate: MangaCreate) => {
  const response = await mangasApi.createMangaApiV1MangasCreatePost({
    mangaCreate,
  });
  return response;
};

export const getSearchResults = async (title: string, sourceName: string) => {
  const response = await sourcesApi.searchMangaApiV1SourcesSearchPost({
    title,
    sourceName,
  });
  return response;
};

export const getSources = async () => {
  const response = await sourcesApi.getSourcesApiV1SourcesGetAllGet();
  return response;
};

export const getAvailableAuthors = async () => {
  const response = await authorApi.getAllAuthorsApiV1AuthorsGetAllGet();
  return response;
};

export const getAvailableGenres = async () => {
  const response = await genresApi.getAllGenresApiV1GenresGetAllGet();
  return response;
};

export const getAvailableLists = async () => {
  const response = await listsApi.getListsApiV1ListsGetAllGet();
  return response;
};

//TODO: Implement Endpoint that does this directly
export const getListsWithCounts = async () => {
  const listsResponse = await listsApi.getListsApiV1ListsGetAllGet();
  const listsWithCounts = await Promise.all(
    listsResponse.map(async (list: ListModel) => {
      const mangas = await getMangasByListId(list.id);
      return {
        ...list,
        mangaCount: mangas.length,
      };
    })
  );
  return listsWithCounts;
};

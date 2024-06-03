import { Manga, MangaCreate } from "../api";
import { AuthorsApi, GenresApi, MangasApi, SourcesApi } from "../api/apis";
import { Configuration, ConfigurationParameters } from "../api/runtime";

const configurationParams: ConfigurationParameters = {
  basePath: "http://localhost:8000",
};
const configuration = new Configuration(configurationParams);

const mangasApi = new MangasApi(configuration);
const authorApi = new AuthorsApi(configuration);
const genresApi = new GenresApi(configuration);
const sourcesApi = new SourcesApi(configuration);

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

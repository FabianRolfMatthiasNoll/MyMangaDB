import {
  HTTPValidationError,
  ListModel,
  Manga,
  MangaCreate,
  ValidationError,
} from "../api";
import {
  AuthorsApi,
  GenresApi,
  MangasApi,
  SourcesApi,
  ListsApi,
} from "../api/apis";
import {
  Configuration,
  ConfigurationParameters,
  ResponseError,
} from "../api/runtime";

const configurationParams: ConfigurationParameters = {
  basePath: "http://localhost:8000",
};
const configuration = new Configuration(configurationParams);

const mangasApi = new MangasApi(configuration);
const authorApi = new AuthorsApi(configuration);
const genresApi = new GenresApi(configuration);
const sourcesApi = new SourcesApi(configuration);
const listsApi = new ListsApi(configuration);

// Function to generate cover image URL
export const getMangaCoverImageUrl = (filepath: string) =>
  `http://localhost:8000/api/v1/images/manga/${filepath}`;

// Generic API call handler to wrap API requests with error handling
const apiCallWrapper = async <T>(apiCall: () => Promise<T>, fallback: T) => {
  try {
    return await apiCall();
  } catch (error) {
    await handleApiError(error);
    return fallback;
  }
};

export const getMangas = async (page: number, limit: number) =>
  apiCallWrapper(
    () =>
      mangasApi.getMangasApiV1MangasGetAllGet({
        skip: (page - 1) * limit,
        limit,
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

export const updateMangaDetails = async (manga: Manga) =>
  apiCallWrapper(
    () => mangasApi.updateMangaApiV1MangasUpdatePut({ manga }),
    null
  );

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

export const getSearchResults = async (title: string, sourceName: string) =>
  apiCallWrapper(
    () =>
      sourcesApi.searchMangaApiV1SourcesSearchPost({
        title,
        sourceName,
      }),
    []
  );

export const getSources = async () =>
  apiCallWrapper(() => sourcesApi.getSourcesApiV1SourcesGetAllGet(), []);

export const getAvailableAuthors = async () =>
  apiCallWrapper(() => authorApi.getAllAuthorsApiV1AuthorsGetAllGet(), []);

export const getAvailableGenres = async () =>
  apiCallWrapper(() => genresApi.getAllGenresApiV1GenresGetAllGet(), []);

export const getAvailableLists = async () =>
  apiCallWrapper(() => listsApi.getListsApiV1ListsGetAllGet(), []);

export const getListsWithCounts = async () => {
  try {
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
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

// Centralized error handling
const handleApiError = async (error: unknown) => {
  const responseError = error as ResponseError;
  // console.error("API Error:", responseError);

  if (responseError.response && responseError.response.json) {
    const errorData: HTTPValidationError = await responseError.response.json();

    if (errorData && errorData.detail) {
      // If it's a simple string message
      if (typeof errorData.detail === "string") {
        alert(errorData.detail);
        return;
      }

      // If it's a validation error with an array of details
      if (Array.isArray(errorData.detail)) {
        const validationErrors = errorData.detail
          .map((err: ValidationError) => {
            const location = err.loc ? err.loc.join(" -> ") : "";
            return `${location}: ${err.msg}`;
          })
          .join("\n");

        alert(`Validation failed:\n${validationErrors}`);
        return;
      }
    }
  }

  // Fallback for unknown errors
  alert("An unexpected error occurred. Please try again later.");
};

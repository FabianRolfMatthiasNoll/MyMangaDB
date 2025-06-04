import {
  HTTPValidationError,
  ListModel,
  Manga,
  MangaCreate,
  ValidationError,
  SourceCreate,
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

// Function to upload manga cover image
export const uploadMangaCover = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://localhost:8000/api/v1/images/manga/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.filename;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Generic API call handler to wrap API requests with error handling
const apiCallWrapper = async <T>(apiCall: () => Promise<T>, fallback: T) => {
  try {
    return await apiCall();
  } catch (error) {
    await handleApiError(error);
    return fallback;
  }
};

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
      // TODO: Move this to backend some day
      // Create a unique filename using UUID and .jpg extension
      const uniqueFilename = `${crypto.randomUUID()}.jpg`;
      coverImagePath = uniqueFilename;

      // Save the file to the backend's image directory
      const formData = new FormData();
      formData.append('file', coverImage);
      formData.append('filename', uniqueFilename);

      const response = await fetch('http://localhost:8000/api/v1/images/manga/save', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save cover image');
      }

      // Wait for the response to ensure the file is saved
      const result = await response.json();
      if (!result.filename) {
        throw new Error('Failed to get filename from server');
      }
      coverImagePath = result.filename;
    }

    // Update the manga with the new cover image path
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

export const createSource = async (sourceCreate: SourceCreate) =>
  apiCallWrapper(
    () => sourcesApi.createSourceApiV1SourcesCreatePost({ sourceCreate }),
    null
  );

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

export interface ListWithCount {
  id: number;
  name: string;
  mangaCount: number;
}

export interface List {
  id: number;
  name: string;
}

export const listService = {
  getAllLists: async (): Promise<List[]> => {
    const response = await listsApi.getListsApiV1ListsGetAllGet();
    return response;
  },

  getListWithCount: async (): Promise<ListWithCount[]> => {
    const response = await listsApi.getListsWithCountApiV1ListsGetAllWithCountGet();
    return response as ListWithCount[];
  },

  getListById: async (listId: number): Promise<List> => {
    const response = await listsApi.getListApiV1ListsListIdGet({ listId });
    return response;
  },

  createList: async (name: string): Promise<List> => {
    const response = await listsApi.createListApiV1ListsCreatePost({
      listCreate: { name }
    });
    return response;
  },

  updateList: async (listId: number, name: string): Promise<List> => {
    const response = await listsApi.updateListApiV1ListsListIdPut({
      listId,
      listCreate: { name }
    });
    return response;
  },

  deleteList: async (listId: number): Promise<List> => {
    const response = await listsApi.deleteListApiV1ListsListIdDelete({
      listId
    });
    return response;
  }
};

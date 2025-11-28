import { apiCallWrapper } from "./errorService";
import { AuthorsApi, MangasApi } from "../api/apis";
import { configuration } from "./config";
import { Author, Manga } from "../api/models";

const authorsApi = new AuthorsApi(configuration);
const mangasApi = new MangasApi(configuration);

export const getAuthors = async (): Promise<Author[]> =>
  apiCallWrapper(() => authorsApi.getAllAuthorsApiV1AuthorsGetAllGet(), []);

export const getAuthorById = async (authorId: number): Promise<Author | null> =>
  apiCallWrapper(() => authorsApi.getAuthorApiV1AuthorsAuthorIdGet({ authorId }), null);

export const getMangasByAuthorId = async (authorId: number): Promise<Manga[]> =>
  apiCallWrapper(() => mangasApi.getMangasByAuthorApiV1MangasByAuthorAuthorIdGet({ authorId }), []);

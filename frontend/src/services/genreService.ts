import { apiCallWrapper } from "./errorService";
import { GenresApi, MangasApi } from "../api/apis";
import { configuration } from "./config";
import { Genre, Manga } from "../api/models";

const genresApi = new GenresApi(configuration);
const mangasApi = new MangasApi(configuration);

export const getGenres = async (skip: number = 0, limit: number = 10): Promise<Genre[]> =>
  apiCallWrapper(() => genresApi.getAllGenresApiV1GenresGetAllGet({ skip, limit }), []);

export const getGenreById = async (genreId: number): Promise<Genre | null> =>
  apiCallWrapper(() => genresApi.getGenreApiV1GenresGenreIdGet({ genreId }), null);

export const getMangasByGenreId = async (genreId: number): Promise<Manga[]> =>
  apiCallWrapper(() => mangasApi.getMangasByGenreApiV1MangasByGenreGenreIdGet({ genreId }), []);

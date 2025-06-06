import { GenresApi } from "../api/apis";
import { configuration } from "./config";
import { apiCallWrapper } from "./errorService";

const genresApi = new GenresApi(configuration);

export const getAvailableGenres = async () =>
  apiCallWrapper(() => genresApi.getAllGenresApiV1GenresGetAllGet(), []); 
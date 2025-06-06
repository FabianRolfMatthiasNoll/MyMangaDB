import { AuthorsApi } from "../api/apis";
import { configuration } from "./config";
import { apiCallWrapper } from "./errorService";

const authorApi = new AuthorsApi(configuration);

export const getAvailableAuthors = async () =>
  apiCallWrapper(() => authorApi.getAllAuthorsApiV1AuthorsGetAllGet(), []); 
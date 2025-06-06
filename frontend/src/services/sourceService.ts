import { SourceCreate } from "../api";
import { SourcesApi } from "../api/apis";
import { configuration } from "./config";
import { apiCallWrapper } from "./errorService";

const sourcesApi = new SourcesApi(configuration);

export const getSources = async () =>
  apiCallWrapper(() => sourcesApi.getSourcesApiV1SourcesGetAllGet(), []);

export const getSearchResults = async (title: string, sourceName: string) =>
  apiCallWrapper(
    () =>
      sourcesApi.searchMangaApiV1SourcesSearchPost({
        title,
        sourceName,
      }),
    []
  );

export const createSource = async (sourceCreate: SourceCreate) =>
  apiCallWrapper(
    () => sourcesApi.createSourceApiV1SourcesCreatePost({ sourceCreate }),
    null
  ); 
import {
  Configuration,
  ConfigurationParameters,
  Middleware,
  RequestContext,
} from "./api/runtime.ts";
import { ExcelInOutApi, JikanApi, MangaApi } from "./api/apis";

const apiKey = "helloworld";
const apiKeyHeaderName = "manga-api-key";

const apiKeyMiddleware: Middleware = {
  pre: async (context: RequestContext): Promise<void> => {
    if (!context.init.headers) {
      context.init.headers = new Headers();
    }
    const headers: Headers =
      context.init.headers instanceof Headers
        ? context.init.headers
        : new Headers(context.init.headers);
    headers.set(apiKeyHeaderName, apiKey);
    context.init.headers = headers;
  },
};

const openRpConfigParams: ConfigurationParameters = {
  basePath: "http://localhost:8000",
  middleware: [apiKeyMiddleware],
};

export const configuration = new Configuration(openRpConfigParams);

export const mangaAPI = new MangaApi(configuration);

export const mangaJikanAPI = new JikanApi(configuration);

export const excelIOAPI = new ExcelInOutApi(configuration);

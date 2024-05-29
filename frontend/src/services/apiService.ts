import { MangasApi } from "../api/apis";
import { Configuration, ConfigurationParameters } from "../api/runtime";

const configurationParams: ConfigurationParameters = {
  basePath: "http://localhost:8000",
};
const configuration = new Configuration(configurationParams);

const mangasApi = new MangasApi(configuration);

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

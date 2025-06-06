import { Configuration, ConfigurationParameters } from "../api/runtime";

export const API_BASE_URL = "http://localhost:8000";

export const configurationParams: ConfigurationParameters = {
  basePath: API_BASE_URL,
};

export const configuration = new Configuration(configurationParams);

export const getImageUrl = (path: string) => `${API_BASE_URL}/api/v1/images/${path}`; 
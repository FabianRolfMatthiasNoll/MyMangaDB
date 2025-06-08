import { apiCallWrapper } from "./errorService";
import { API_BASE_URL } from "./config";
import { SettingsApi } from "../api/apis/SettingsApi";
import { Configuration } from "../api/runtime";

const apiConfig = new Configuration({
  basePath: API_BASE_URL
});

const settingsApi = new SettingsApi(apiConfig);

export interface Settings {
  database_path: string;
  image_path: string;
}

const defaultSettings: Settings = {
  database_path: "",
  image_path: ""
};

export const getSettings = async (): Promise<Settings> => {
  return apiCallWrapper(
    async () => {
      const response = await settingsApi.getAllSettingsApiV1SettingsGetAllGet();
      return response as Settings;
    },
    defaultSettings
  );
};

export const updateSetting = async (key: string, value: string, migrate: boolean = false): Promise<Settings> => {
  return apiCallWrapper(
    async () => {
      const response = await settingsApi.createOrUpdateSettingApiV1SettingsKeyPost({
        key,
        value,
        migrate
      });
      return response as Settings;
    },
    defaultSettings
  );
}; 
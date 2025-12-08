import { StatisticsApi } from "../api/apis";
import { Statistics } from "../api/models";
import { configuration } from "./config";
import { apiCallWrapper } from "./errorService";

const statisticsApi = new StatisticsApi(configuration);

export const getStatistics = async (): Promise<Statistics | null> => {
  return apiCallWrapper<Statistics | null>(
    () => statisticsApi.getStatisticsApiV1StatisticsGet(),
    null
  );
};

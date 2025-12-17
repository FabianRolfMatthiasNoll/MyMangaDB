import { ImportApi } from "../api/apis";
import { configuration } from "./config";
import { apiCallWrapper } from "./errorService";

const importApi = new ImportApi(configuration);

export const importMalList = async (file: File) => {
  return apiCallWrapper(
    () =>
      importApi.importMalListApiV1ImportMalPost({
        file: file,
      }),
    null
  );
};

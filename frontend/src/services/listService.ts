import { ListModel } from "../api";
import { ListsApi } from "../api/apis";
import { configuration } from "./config";
import { apiCallWrapper } from "./errorService";
import { getMangasByListId } from "./mangaService";

const listsApi = new ListsApi(configuration);

export interface ListWithCount extends ListModel {
  mangaCount: number;
}

export const getAllLists = async (): Promise<ListModel[]> =>
  apiCallWrapper(() => listsApi.getListsApiV1ListsGetAllGet(), []);

export const getListWithCount = async (): Promise<ListWithCount[]> => {
  try {
    const listsResponse = await listsApi.getListsApiV1ListsGetAllGet();
    const listsWithCounts = await Promise.all(
      listsResponse.map(async (list: ListModel) => {
        const mangas = await getMangasByListId(list.id);
        return {
          ...list,
          mangaCount: mangas.length,
        };
      })
    );
    return listsWithCounts;
  } catch (error) {
    console.error("Error getting lists with counts:", error);
    return [];
  }
};

export const getListById = async (listId: number): Promise<ListModel | null> =>
  apiCallWrapper(
    () => listsApi.getListApiV1ListsListIdGet({ listId }),
    null
  );

export const createList = async (name: string): Promise<ListModel | null> =>
  apiCallWrapper(
    () => listsApi.createListApiV1ListsCreatePost({
      listCreate: { name }
    }),
    null
  );

export const updateList = async (listId: number, name: string): Promise<ListModel | null> =>
  apiCallWrapper(
    () => listsApi.updateListApiV1ListsListIdPut({
      listId,
      listCreate: { name }
    }),
    null
  );

export const deleteList = async (listId: number): Promise<ListModel | null> =>
  apiCallWrapper(
    () => listsApi.deleteListApiV1ListsListIdDelete({
      listId
    }),
    null
  );

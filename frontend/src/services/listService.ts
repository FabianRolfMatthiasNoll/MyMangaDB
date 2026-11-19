import { ListModel } from "../api";
import { ListsApi } from "../api/apis";
import { configuration } from "./config";
import { apiCallWrapper } from "./errorService";

const listsApi = new ListsApi(configuration);

export interface ListWithCount extends ListModel {
  mangaCount: number;
}

export const getAllLists = async (): Promise<ListModel[]> =>
  apiCallWrapper(() => listsApi.getListsApiV1ListsGetAllGet(), []);

/**
 * All lists with the number of manga they hold.
 *
 * The counts come from the backend, which aggregates them in a single query.
 * Fetching the manga of every list separately would mean one request per
 * list and would transfer every manga in the collection just to count them.
 */
export const getListWithCount = async (): Promise<ListWithCount[]> => {
  const lists = await apiCallWrapper(
    () => listsApi.getListsWithCountApiV1ListsGetAllWithCountGet(),
    []
  );
  return lists as unknown as ListWithCount[];
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

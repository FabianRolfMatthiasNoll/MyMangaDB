# ListsApi

All URIs are relative to _http://localhost_

| Method                                                                                                         | HTTP request                           | Description          |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------- | -------------------- |
| [**createListApiV1ListsCreatePost**](ListsApi.md#createlistapiv1listscreatepost)                               | **POST** /api/v1/lists/create          | Create List          |
| [**deleteListApiV1ListsListIdDelete**](ListsApi.md#deletelistapiv1listslistiddelete)                           | **DELETE** /api/v1/lists/{list_id}     | Delete List          |
| [**getListApiV1ListsListIdGet**](ListsApi.md#getlistapiv1listslistidget)                                       | **GET** /api/v1/lists/{list_id}        | Get List             |
| [**getListsApiV1ListsGetAllGet**](ListsApi.md#getlistsapiv1listsgetallget)                                     | **GET** /api/v1/lists/getAll           | Get Lists            |
| [**getListsWithCountApiV1ListsGetAllWithCountGet**](ListsApi.md#getlistswithcountapiv1listsgetallwithcountget) | **GET** /api/v1/lists/getAll/withCount | Get Lists With Count |
| [**updateListApiV1ListsListIdPut**](ListsApi.md#updatelistapiv1listslistidput)                                 | **PUT** /api/v1/lists/{list_id}        | Update List          |

## createListApiV1ListsCreatePost

> ListModel createListApiV1ListsCreatePost(listCreate)

Create List

### Example

```ts
import {
  Configuration,
  ListsApi,
} from '';
import type { CreateListApiV1ListsCreatePostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ListsApi();

  const body = {
    // ListCreate
    listCreate: ...,
  } satisfies CreateListApiV1ListsCreatePostRequest;

  try {
    const data = await api.createListApiV1ListsCreatePost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name           | Type                        | Description | Notes |
| -------------- | --------------------------- | ----------- | ----- |
| **listCreate** | [ListCreate](ListCreate.md) |             |       |

### Return type

[**ListModel**](ListModel.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful Response | -                |
| **422**     | Validation Error    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## deleteListApiV1ListsListIdDelete

> ListModel deleteListApiV1ListsListIdDelete(listId)

Delete List

### Example

```ts
import { Configuration, ListsApi } from "";
import type { DeleteListApiV1ListsListIdDeleteRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ListsApi();

  const body = {
    // number
    listId: 56,
  } satisfies DeleteListApiV1ListsListIdDeleteRequest;

  try {
    const data = await api.deleteListApiV1ListsListIdDelete(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name       | Type     | Description | Notes                     |
| ---------- | -------- | ----------- | ------------------------- |
| **listId** | `number` |             | [Defaults to `undefined`] |

### Return type

[**ListModel**](ListModel.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful Response | -                |
| **422**     | Validation Error    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getListApiV1ListsListIdGet

> ListModel getListApiV1ListsListIdGet(listId)

Get List

### Example

```ts
import { Configuration, ListsApi } from "";
import type { GetListApiV1ListsListIdGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ListsApi();

  const body = {
    // number
    listId: 56,
  } satisfies GetListApiV1ListsListIdGetRequest;

  try {
    const data = await api.getListApiV1ListsListIdGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name       | Type     | Description | Notes                     |
| ---------- | -------- | ----------- | ------------------------- |
| **listId** | `number` |             | [Defaults to `undefined`] |

### Return type

[**ListModel**](ListModel.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful Response | -                |
| **422**     | Validation Error    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getListsApiV1ListsGetAllGet

> Array&lt;ListModel&gt; getListsApiV1ListsGetAllGet()

Get Lists

### Example

```ts
import { Configuration, ListsApi } from "";
import type { GetListsApiV1ListsGetAllGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ListsApi();

  try {
    const data = await api.getListsApiV1ListsGetAllGet();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;ListModel&gt;**](ListModel.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful Response | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getListsWithCountApiV1ListsGetAllWithCountGet

> Array&lt;{ [key: string]: any | null; }&gt; getListsWithCountApiV1ListsGetAllWithCountGet()

Get Lists With Count

### Example

```ts
import { Configuration, ListsApi } from "";
import type { GetListsWithCountApiV1ListsGetAllWithCountGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ListsApi();

  try {
    const data = await api.getListsWithCountApiV1ListsGetAllWithCountGet();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**Array<{ [key: string]: any | null; }>**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful Response | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## updateListApiV1ListsListIdPut

> ListModel updateListApiV1ListsListIdPut(listId, listCreate)

Update List

### Example

```ts
import {
  Configuration,
  ListsApi,
} from '';
import type { UpdateListApiV1ListsListIdPutRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ListsApi();

  const body = {
    // number
    listId: 56,
    // ListCreate
    listCreate: ...,
  } satisfies UpdateListApiV1ListsListIdPutRequest;

  try {
    const data = await api.updateListApiV1ListsListIdPut(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name           | Type                        | Description | Notes                     |
| -------------- | --------------------------- | ----------- | ------------------------- |
| **listId**     | `number`                    |             | [Defaults to `undefined`] |
| **listCreate** | [ListCreate](ListCreate.md) |             |                           |

### Return type

[**ListModel**](ListModel.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful Response | -                |
| **422**     | Validation Error    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

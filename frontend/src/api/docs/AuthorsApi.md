# AuthorsApi

All URIs are relative to _http://localhost_

| Method                                                                                     | HTTP request                        | Description     |
| ------------------------------------------------------------------------------------------ | ----------------------------------- | --------------- |
| [**createAuthorApiV1AuthorsCreatePost**](AuthorsApi.md#createauthorapiv1authorscreatepost) | **POST** /api/v1/authors/create     | Create Author   |
| [**getAllAuthorsApiV1AuthorsGetAllGet**](AuthorsApi.md#getallauthorsapiv1authorsgetallget) | **GET** /api/v1/authors/getAll      | Get All Authors |
| [**getAuthorApiV1AuthorsAuthorIdGet**](AuthorsApi.md#getauthorapiv1authorsauthoridget)     | **GET** /api/v1/authors/{author_id} | Get Author      |

## createAuthorApiV1AuthorsCreatePost

> Author createAuthorApiV1AuthorsCreatePost(authorCreate)

Create Author

### Example

```ts
import {
  Configuration,
  AuthorsApi,
} from '';
import type { CreateAuthorApiV1AuthorsCreatePostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthorsApi();

  const body = {
    // AuthorCreate
    authorCreate: ...,
  } satisfies CreateAuthorApiV1AuthorsCreatePostRequest;

  try {
    const data = await api.createAuthorApiV1AuthorsCreatePost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name             | Type                            | Description | Notes |
| ---------------- | ------------------------------- | ----------- | ----- |
| **authorCreate** | [AuthorCreate](AuthorCreate.md) |             |       |

### Return type

[**Author**](Author.md)

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

## getAllAuthorsApiV1AuthorsGetAllGet

> Array&lt;Author&gt; getAllAuthorsApiV1AuthorsGetAllGet(skip, limit)

Get All Authors

### Example

```ts
import { Configuration, AuthorsApi } from "";
import type { GetAllAuthorsApiV1AuthorsGetAllGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthorsApi();

  const body = {
    // number (optional)
    skip: 56,
    // number (optional)
    limit: 56,
  } satisfies GetAllAuthorsApiV1AuthorsGetAllGetRequest;

  try {
    const data = await api.getAllAuthorsApiV1AuthorsGetAllGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name      | Type     | Description | Notes                         |
| --------- | -------- | ----------- | ----------------------------- |
| **skip**  | `number` |             | [Optional] [Defaults to `0`]  |
| **limit** | `number` |             | [Optional] [Defaults to `10`] |

### Return type

[**Array&lt;Author&gt;**](Author.md)

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

## getAuthorApiV1AuthorsAuthorIdGet

> Author getAuthorApiV1AuthorsAuthorIdGet(authorId)

Get Author

### Example

```ts
import { Configuration, AuthorsApi } from "";
import type { GetAuthorApiV1AuthorsAuthorIdGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthorsApi();

  const body = {
    // number
    authorId: 56,
  } satisfies GetAuthorApiV1AuthorsAuthorIdGetRequest;

  try {
    const data = await api.getAuthorApiV1AuthorsAuthorIdGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name         | Type     | Description | Notes                     |
| ------------ | -------- | ----------- | ------------------------- |
| **authorId** | `number` |             | [Defaults to `undefined`] |

### Return type

[**Author**](Author.md)

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

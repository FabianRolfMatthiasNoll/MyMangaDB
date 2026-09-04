# GenresApi

All URIs are relative to _http://localhost_

| Method                                                                                | HTTP request                      | Description    |
| ------------------------------------------------------------------------------------- | --------------------------------- | -------------- |
| [**createGenreApiV1GenresCreatePost**](GenresApi.md#creategenreapiv1genrescreatepost) | **POST** /api/v1/genres/create    | Create Genre   |
| [**getAllGenresApiV1GenresGetAllGet**](GenresApi.md#getallgenresapiv1genresgetallget) | **GET** /api/v1/genres/getAll     | Get All Genres |
| [**getGenreApiV1GenresGenreIdGet**](GenresApi.md#getgenreapiv1genresgenreidget)       | **GET** /api/v1/genres/{genre_id} | Get Genre      |

## createGenreApiV1GenresCreatePost

> Genre createGenreApiV1GenresCreatePost(genreCreate)

Create Genre

### Example

```ts
import {
  Configuration,
  GenresApi,
} from '';
import type { CreateGenreApiV1GenresCreatePostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new GenresApi();

  const body = {
    // GenreCreate
    genreCreate: ...,
  } satisfies CreateGenreApiV1GenresCreatePostRequest;

  try {
    const data = await api.createGenreApiV1GenresCreatePost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name            | Type                          | Description | Notes |
| --------------- | ----------------------------- | ----------- | ----- |
| **genreCreate** | [GenreCreate](GenreCreate.md) |             |       |

### Return type

[**Genre**](Genre.md)

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

## getAllGenresApiV1GenresGetAllGet

> Array&lt;Genre&gt; getAllGenresApiV1GenresGetAllGet(skip, limit)

Get All Genres

### Example

```ts
import { Configuration, GenresApi } from "";
import type { GetAllGenresApiV1GenresGetAllGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new GenresApi();

  const body = {
    // number (optional)
    skip: 56,
    // number (optional)
    limit: 56,
  } satisfies GetAllGenresApiV1GenresGetAllGetRequest;

  try {
    const data = await api.getAllGenresApiV1GenresGetAllGet(body);
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

[**Array&lt;Genre&gt;**](Genre.md)

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

## getGenreApiV1GenresGenreIdGet

> Genre getGenreApiV1GenresGenreIdGet(genreId)

Get Genre

### Example

```ts
import { Configuration, GenresApi } from "";
import type { GetGenreApiV1GenresGenreIdGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new GenresApi();

  const body = {
    // number
    genreId: 56,
  } satisfies GetGenreApiV1GenresGenreIdGetRequest;

  try {
    const data = await api.getGenreApiV1GenresGenreIdGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name        | Type     | Description | Notes                     |
| ----------- | -------- | ----------- | ------------------------- |
| **genreId** | `number` |             | [Defaults to `undefined`] |

### Return type

[**Genre**](Genre.md)

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

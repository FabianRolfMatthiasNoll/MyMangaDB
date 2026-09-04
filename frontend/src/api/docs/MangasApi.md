# MangasApi

All URIs are relative to _http://localhost_

| Method                                                                                                                  | HTTP request                                 | Description                                         |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------- |
| [**createMangaApiV1MangasCreatePost**](MangasApi.md#createmangaapiv1mangascreatepost)                                   | **POST** /api/v1/mangas/create               | Create Manga                                        |
| [**createMangaListApiV1MangasCreateListPost**](MangasApi.md#createmangalistapiv1mangascreatelistpost)                   | **POST** /api/v1/mangas/create-list          | Create Manga List                                   |
| [**deleteMangaApiV1MangasMangaIdDelete**](MangasApi.md#deletemangaapiv1mangasmangaiddelete)                             | **DELETE** /api/v1/mangas/{manga_id}         | Delete Manga                                        |
| [**getMangaByIdApiV1MangasMangaIdGet**](MangasApi.md#getmangabyidapiv1mangasmangaidget)                                 | **GET** /api/v1/mangas/{manga_id}            | Get Manga By Id                                     |
| [**getMangasApiV1MangasGetAllGet**](MangasApi.md#getmangasapiv1mangasgetallget)                                         | **GET** /api/v1/mangas/getAll                | Get mangas with server-side paging, search and sort |
| [**getMangasByAuthorApiV1MangasByAuthorAuthorIdGet**](MangasApi.md#getmangasbyauthorapiv1mangasbyauthorauthoridget)     | **GET** /api/v1/mangas/by-author/{author_id} | Get Mangas By Author                                |
| [**getMangasByGenreApiV1MangasByGenreGenreIdGet**](MangasApi.md#getmangasbygenreapiv1mangasbygenregenreidget)           | **GET** /api/v1/mangas/by-genre/{genre_id}   | Get Mangas By Genre                                 |
| [**getMangasByListApiV1MangasByListListIdGet**](MangasApi.md#getmangasbylistapiv1mangasbylistlistidget)                 | **GET** /api/v1/mangas/by-list/{list_id}     | Get Mangas By List                                  |
| [**getMangasByStarRatingApiV1MangasByRatingRatingGet**](MangasApi.md#getmangasbystarratingapiv1mangasbyratingratingget) | **GET** /api/v1/mangas/by-rating/{rating}    | Get Mangas By Star Rating                           |
| [**updateMangaApiV1MangasUpdatePut**](MangasApi.md#updatemangaapiv1mangasupdateput)                                     | **PUT** /api/v1/mangas/update                | Update Manga                                        |

## createMangaApiV1MangasCreatePost

> Manga createMangaApiV1MangasCreatePost(mangaCreate)

Create Manga

### Example

```ts
import {
  Configuration,
  MangasApi,
} from '';
import type { CreateMangaApiV1MangasCreatePostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: OAuth2PasswordBearer password
    accessToken: "YOUR ACCESS TOKEN",
  });
  const api = new MangasApi(config);

  const body = {
    // MangaCreate
    mangaCreate: ...,
  } satisfies CreateMangaApiV1MangasCreatePostRequest;

  try {
    const data = await api.createMangaApiV1MangasCreatePost(body);
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
| **mangaCreate** | [MangaCreate](MangaCreate.md) |             |       |

### Return type

[**Manga**](Manga.md)

### Authorization

[OAuth2PasswordBearer password](../README.md#OAuth2PasswordBearer-password)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **201**     | Successful Response | -                |
| **422**     | Validation Error    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## createMangaListApiV1MangasCreateListPost

> Array&lt;Manga&gt; createMangaListApiV1MangasCreateListPost(mangaCreate)

Create Manga List

### Example

```ts
import {
  Configuration,
  MangasApi,
} from '';
import type { CreateMangaListApiV1MangasCreateListPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: OAuth2PasswordBearer password
    accessToken: "YOUR ACCESS TOKEN",
  });
  const api = new MangasApi(config);

  const body = {
    // Array<MangaCreate>
    mangaCreate: ...,
  } satisfies CreateMangaListApiV1MangasCreateListPostRequest;

  try {
    const data = await api.createMangaListApiV1MangasCreateListPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name            | Type                 | Description | Notes |
| --------------- | -------------------- | ----------- | ----- |
| **mangaCreate** | `Array<MangaCreate>` |             |       |

### Return type

[**Array&lt;Manga&gt;**](Manga.md)

### Authorization

[OAuth2PasswordBearer password](../README.md#OAuth2PasswordBearer-password)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **201**     | Successful Response | -                |
| **422**     | Validation Error    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## deleteMangaApiV1MangasMangaIdDelete

> Manga deleteMangaApiV1MangasMangaIdDelete(mangaId)

Delete Manga

### Example

```ts
import { Configuration, MangasApi } from "";
import type { DeleteMangaApiV1MangasMangaIdDeleteRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: OAuth2PasswordBearer password
    accessToken: "YOUR ACCESS TOKEN",
  });
  const api = new MangasApi(config);

  const body = {
    // number
    mangaId: 56,
  } satisfies DeleteMangaApiV1MangasMangaIdDeleteRequest;

  try {
    const data = await api.deleteMangaApiV1MangasMangaIdDelete(body);
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
| **mangaId** | `number` |             | [Defaults to `undefined`] |

### Return type

[**Manga**](Manga.md)

### Authorization

[OAuth2PasswordBearer password](../README.md#OAuth2PasswordBearer-password)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful Response | -                |
| **422**     | Validation Error    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getMangaByIdApiV1MangasMangaIdGet

> Manga getMangaByIdApiV1MangasMangaIdGet(mangaId)

Get Manga By Id

### Example

```ts
import { Configuration, MangasApi } from "";
import type { GetMangaByIdApiV1MangasMangaIdGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: OAuth2PasswordBearer password
    accessToken: "YOUR ACCESS TOKEN",
  });
  const api = new MangasApi(config);

  const body = {
    // number
    mangaId: 56,
  } satisfies GetMangaByIdApiV1MangasMangaIdGetRequest;

  try {
    const data = await api.getMangaByIdApiV1MangasMangaIdGet(body);
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
| **mangaId** | `number` |             | [Defaults to `undefined`] |

### Return type

[**Manga**](Manga.md)

### Authorization

[OAuth2PasswordBearer password](../README.md#OAuth2PasswordBearer-password)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful Response | -                |
| **422**     | Validation Error    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getMangasApiV1MangasGetAllGet

> Array&lt;Manga&gt; getMangasApiV1MangasGetAllGet(skip, limit, search, sort, categories, readingStatuses, overallStatuses, ratingMin, ratingMax)

Get mangas with server-side paging, search and sort

Delivers a paginated list of mangas. Optional search (title LIKE), filters (category, status, rating), and sort order can be specified.

### Example

```ts
import {
  Configuration,
  MangasApi,
} from '';
import type { GetMangasApiV1MangasGetAllGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: OAuth2PasswordBearer password
    accessToken: "YOUR ACCESS TOKEN",
  });
  const api = new MangasApi(config);

  const body = {
    // number (optional)
    skip: 56,
    // number (optional)
    limit: 56,
    // string | Search term for title (optional)
    search: search_example,
    // string | Sort by title (optional)
    sort: sort_example,
    // Array<string> | Filter by categories (optional)
    categories: ...,
    // Array<string> | Filter by reading statuses (optional)
    readingStatuses: ...,
    // Array<string> | Filter by overall statuses (optional)
    overallStatuses: ...,
    // number | Minimum rating (optional)
    ratingMin: 8.14,
    // number | Maximum rating (optional)
    ratingMax: 8.14,
  } satisfies GetMangasApiV1MangasGetAllGetRequest;

  try {
    const data = await api.getMangasApiV1MangasGetAllGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                | Type            | Description                | Notes                                |
| ------------------- | --------------- | -------------------------- | ------------------------------------ |
| **skip**            | `number`        |                            | [Optional] [Defaults to `0`]         |
| **limit**           | `number`        |                            | [Optional] [Defaults to `10`]        |
| **search**          | `string`        | Search term for title      | [Optional] [Defaults to `undefined`] |
| **sort**            | `string`        | Sort by title              | [Optional] [Defaults to `undefined`] |
| **categories**      | `Array<string>` | Filter by categories       | [Optional]                           |
| **readingStatuses** | `Array<string>` | Filter by reading statuses | [Optional]                           |
| **overallStatuses** | `Array<string>` | Filter by overall statuses | [Optional]                           |
| **ratingMin**       | `number`        | Minimum rating             | [Optional] [Defaults to `undefined`] |
| **ratingMax**       | `number`        | Maximum rating             | [Optional] [Defaults to `undefined`] |

### Return type

[**Array&lt;Manga&gt;**](Manga.md)

### Authorization

[OAuth2PasswordBearer password](../README.md#OAuth2PasswordBearer-password)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful Response | -                |
| **422**     | Validation Error    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getMangasByAuthorApiV1MangasByAuthorAuthorIdGet

> Array&lt;Manga&gt; getMangasByAuthorApiV1MangasByAuthorAuthorIdGet(authorId)

Get Mangas By Author

### Example

```ts
import { Configuration, MangasApi } from "";
import type { GetMangasByAuthorApiV1MangasByAuthorAuthorIdGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: OAuth2PasswordBearer password
    accessToken: "YOUR ACCESS TOKEN",
  });
  const api = new MangasApi(config);

  const body = {
    // number
    authorId: 56,
  } satisfies GetMangasByAuthorApiV1MangasByAuthorAuthorIdGetRequest;

  try {
    const data =
      await api.getMangasByAuthorApiV1MangasByAuthorAuthorIdGet(body);
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

[**Array&lt;Manga&gt;**](Manga.md)

### Authorization

[OAuth2PasswordBearer password](../README.md#OAuth2PasswordBearer-password)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful Response | -                |
| **422**     | Validation Error    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getMangasByGenreApiV1MangasByGenreGenreIdGet

> Array&lt;Manga&gt; getMangasByGenreApiV1MangasByGenreGenreIdGet(genreId)

Get Mangas By Genre

### Example

```ts
import { Configuration, MangasApi } from "";
import type { GetMangasByGenreApiV1MangasByGenreGenreIdGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: OAuth2PasswordBearer password
    accessToken: "YOUR ACCESS TOKEN",
  });
  const api = new MangasApi(config);

  const body = {
    // number
    genreId: 56,
  } satisfies GetMangasByGenreApiV1MangasByGenreGenreIdGetRequest;

  try {
    const data = await api.getMangasByGenreApiV1MangasByGenreGenreIdGet(body);
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

[**Array&lt;Manga&gt;**](Manga.md)

### Authorization

[OAuth2PasswordBearer password](../README.md#OAuth2PasswordBearer-password)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful Response | -                |
| **422**     | Validation Error    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getMangasByListApiV1MangasByListListIdGet

> Array&lt;Manga&gt; getMangasByListApiV1MangasByListListIdGet(listId)

Get Mangas By List

### Example

```ts
import { Configuration, MangasApi } from "";
import type { GetMangasByListApiV1MangasByListListIdGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: OAuth2PasswordBearer password
    accessToken: "YOUR ACCESS TOKEN",
  });
  const api = new MangasApi(config);

  const body = {
    // number
    listId: 56,
  } satisfies GetMangasByListApiV1MangasByListListIdGetRequest;

  try {
    const data = await api.getMangasByListApiV1MangasByListListIdGet(body);
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

[**Array&lt;Manga&gt;**](Manga.md)

### Authorization

[OAuth2PasswordBearer password](../README.md#OAuth2PasswordBearer-password)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful Response | -                |
| **422**     | Validation Error    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getMangasByStarRatingApiV1MangasByRatingRatingGet

> Array&lt;Manga&gt; getMangasByStarRatingApiV1MangasByRatingRatingGet(rating)

Get Mangas By Star Rating

### Example

```ts
import { Configuration, MangasApi } from "";
import type { GetMangasByStarRatingApiV1MangasByRatingRatingGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: OAuth2PasswordBearer password
    accessToken: "YOUR ACCESS TOKEN",
  });
  const api = new MangasApi(config);

  const body = {
    // number
    rating: 8.14,
  } satisfies GetMangasByStarRatingApiV1MangasByRatingRatingGetRequest;

  try {
    const data =
      await api.getMangasByStarRatingApiV1MangasByRatingRatingGet(body);
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
| **rating** | `number` |             | [Defaults to `undefined`] |

### Return type

[**Array&lt;Manga&gt;**](Manga.md)

### Authorization

[OAuth2PasswordBearer password](../README.md#OAuth2PasswordBearer-password)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful Response | -                |
| **422**     | Validation Error    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## updateMangaApiV1MangasUpdatePut

> Manga updateMangaApiV1MangasUpdatePut(manga)

Update Manga

### Example

```ts
import {
  Configuration,
  MangasApi,
} from '';
import type { UpdateMangaApiV1MangasUpdatePutRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: OAuth2PasswordBearer password
    accessToken: "YOUR ACCESS TOKEN",
  });
  const api = new MangasApi(config);

  const body = {
    // Manga
    manga: ...,
  } satisfies UpdateMangaApiV1MangasUpdatePutRequest;

  try {
    const data = await api.updateMangaApiV1MangasUpdatePut(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name      | Type              | Description | Notes |
| --------- | ----------------- | ----------- | ----- |
| **manga** | [Manga](Manga.md) |             |       |

### Return type

[**Manga**](Manga.md)

### Authorization

[OAuth2PasswordBearer password](../README.md#OAuth2PasswordBearer-password)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful Response | -                |
| **422**     | Validation Error    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

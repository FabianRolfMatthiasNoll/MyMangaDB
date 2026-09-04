# SourcesApi

All URIs are relative to _http://localhost_

| Method                                                                                     | HTTP request                    | Description   |
| ------------------------------------------------------------------------------------------ | ------------------------------- | ------------- |
| [**createSourceApiV1SourcesCreatePost**](SourcesApi.md#createsourceapiv1sourcescreatepost) | **POST** /api/v1/sources/create | Create Source |
| [**getSourcesApiV1SourcesGetAllGet**](SourcesApi.md#getsourcesapiv1sourcesgetallget)       | **GET** /api/v1/sources/getAll  | Get Sources   |
| [**searchMangaApiV1SourcesSearchPost**](SourcesApi.md#searchmangaapiv1sourcessearchpost)   | **POST** /api/v1/sources/search | Search Manga  |

## createSourceApiV1SourcesCreatePost

> Source createSourceApiV1SourcesCreatePost(sourceCreate)

Create Source

### Example

```ts
import {
  Configuration,
  SourcesApi,
} from '';
import type { CreateSourceApiV1SourcesCreatePostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SourcesApi();

  const body = {
    // SourceCreate
    sourceCreate: ...,
  } satisfies CreateSourceApiV1SourcesCreatePostRequest;

  try {
    const data = await api.createSourceApiV1SourcesCreatePost(body);
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
| **sourceCreate** | [SourceCreate](SourceCreate.md) |             |       |

### Return type

[**Source**](Source.md)

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

## getSourcesApiV1SourcesGetAllGet

> Array&lt;Source&gt; getSourcesApiV1SourcesGetAllGet()

Get Sources

### Example

```ts
import { Configuration, SourcesApi } from "";
import type { GetSourcesApiV1SourcesGetAllGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SourcesApi();

  try {
    const data = await api.getSourcesApiV1SourcesGetAllGet();
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

[**Array&lt;Source&gt;**](Source.md)

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

## searchMangaApiV1SourcesSearchPost

> Array&lt;MangaCreate&gt; searchMangaApiV1SourcesSearchPost(title, sourceName)

Search Manga

### Example

```ts
import { Configuration, SourcesApi } from "";
import type { SearchMangaApiV1SourcesSearchPostRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SourcesApi();

  const body = {
    // string
    title: title_example,
    // string
    sourceName: sourceName_example,
  } satisfies SearchMangaApiV1SourcesSearchPostRequest;

  try {
    const data = await api.searchMangaApiV1SourcesSearchPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name           | Type     | Description | Notes                     |
| -------------- | -------- | ----------- | ------------------------- |
| **title**      | `string` |             | [Defaults to `undefined`] |
| **sourceName** | `string` |             | [Defaults to `undefined`] |

### Return type

[**Array&lt;MangaCreate&gt;**](MangaCreate.md)

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

# ImagesApi

All URIs are relative to _http://localhost_

| Method                                                                                                              | HTTP request                             | Description            |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------- |
| [**getMangaCoverImageApiV1ImagesMangaFilenameGet**](ImagesApi.md#getmangacoverimageapiv1imagesmangafilenameget)     | **GET** /api/v1/images/manga/{filename}  | Get Manga Cover Image  |
| [**getVolumeCoverImageApiV1ImagesVolumeFilenameGet**](ImagesApi.md#getvolumecoverimageapiv1imagesvolumefilenameget) | **GET** /api/v1/images/volume/{filename} | Get Volume Cover Image |
| [**saveMangaCoverApiV1ImagesMangaSavePost**](ImagesApi.md#savemangacoverapiv1imagesmangasavepost)                   | **POST** /api/v1/images/manga/save       | Save Manga Cover       |

## getMangaCoverImageApiV1ImagesMangaFilenameGet

> any getMangaCoverImageApiV1ImagesMangaFilenameGet(filename)

Get Manga Cover Image

Return a manga cover image. The path parameter is untrusted, so it is sanitized via :func:&#x60;\_sanitize_filename&#x60; and confined to :data:&#x60;IMAGE_SAVE_PATH&#x60; via :func:&#x60;\_safe_join&#x60; to defend against path traversal. Note: this endpoint is intentionally unauthenticated. Cover art is already visible to anyone who can read manga metadata via the auth-gated &#x60;&#x60;/api/v1/mangas/...&#x60;&#x60; endpoints, and the frontend renders these images via raw &#x60;&#x60;&lt;img src&gt;&#x60;&#x60; tags which cannot attach bearer tokens. Filename sanitization is the real defense here.

### Example

```ts
import { Configuration, ImagesApi } from "";
import type { GetMangaCoverImageApiV1ImagesMangaFilenameGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ImagesApi();

  const body = {
    // string
    filename: filename_example,
  } satisfies GetMangaCoverImageApiV1ImagesMangaFilenameGetRequest;

  try {
    const data = await api.getMangaCoverImageApiV1ImagesMangaFilenameGet(body);
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
| **filename** | `string` |             | [Defaults to `undefined`] |

### Return type

**any**

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

## getVolumeCoverImageApiV1ImagesVolumeFilenameGet

> any getVolumeCoverImageApiV1ImagesVolumeFilenameGet(filename)

Get Volume Cover Image

Return a volume cover image. See :func:&#x60;get_manga_cover_image&#x60; for the rationale on authentication and path-traversal protection.

### Example

```ts
import { Configuration, ImagesApi } from "";
import type { GetVolumeCoverImageApiV1ImagesVolumeFilenameGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ImagesApi();

  const body = {
    // string
    filename: filename_example,
  } satisfies GetVolumeCoverImageApiV1ImagesVolumeFilenameGetRequest;

  try {
    const data =
      await api.getVolumeCoverImageApiV1ImagesVolumeFilenameGet(body);
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
| **filename** | `string` |             | [Defaults to `undefined`] |

### Return type

**any**

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

## saveMangaCoverApiV1ImagesMangaSavePost

> any saveMangaCoverApiV1ImagesMangaSavePost(file, filename)

Save Manga Cover

Save a cover image. Requires an authenticated admin user. Matches the write-vs-read auth split used in :mod:&#x60;backend.app.api.v1.endpoints.manga&#x60; where mutating endpoints are gated by :func:&#x60;deps.get_current_active_superuser&#x60;.

### Example

```ts
import { Configuration, ImagesApi } from "";
import type { SaveMangaCoverApiV1ImagesMangaSavePostRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: OAuth2PasswordBearer password
    accessToken: "YOUR ACCESS TOKEN",
  });
  const api = new ImagesApi(config);

  const body = {
    // Blob
    file: BINARY_DATA_HERE,
    // string
    filename: filename_example,
  } satisfies SaveMangaCoverApiV1ImagesMangaSavePostRequest;

  try {
    const data = await api.saveMangaCoverApiV1ImagesMangaSavePost(body);
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
| **file**     | `Blob`   |             | [Defaults to `undefined`] |
| **filename** | `string` |             | [Defaults to `undefined`] |

### Return type

**any**

### Authorization

[OAuth2PasswordBearer password](../README.md#OAuth2PasswordBearer-password)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful Response | -                |
| **422**     | Validation Error    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

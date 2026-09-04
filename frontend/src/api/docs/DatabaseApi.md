# DatabaseApi

All URIs are relative to _http://localhost_

| Method                                                                                            | HTTP request                     | Description     |
| ------------------------------------------------------------------------------------------------- | -------------------------------- | --------------- |
| [**exportDatabaseApiV1DatabaseExportGet**](DatabaseApi.md#exportdatabaseapiv1databaseexportget)   | **GET** /api/v1/database/export  | Export Database |
| [**importDatabaseApiV1DatabaseImportPost**](DatabaseApi.md#importdatabaseapiv1databaseimportpost) | **POST** /api/v1/database/import | Import Database |

## exportDatabaseApiV1DatabaseExportGet

> exportDatabaseApiV1DatabaseExportGet()

Export Database

Export the database and images as a ZIP file. Requires an authenticated admin user. Both reading the live database file (which contains user password hashes) and downloading every stored image are inherently privileged operations. Returns: Response: A ZIP file containing the database and images. The response will have the following headers: - Content-Type: application/zip - Content-Disposition: attachment; filename&#x3D;\&quot;mangadb_export.zip\&quot;

### Example

```ts
import { Configuration, DatabaseApi } from "";
import type { ExportDatabaseApiV1DatabaseExportGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: OAuth2PasswordBearer password
    accessToken: "YOUR ACCESS TOKEN",
  });
  const api = new DatabaseApi(config);

  try {
    const data = await api.exportDatabaseApiV1DatabaseExportGet();
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

`void` (Empty response body)

### Authorization

[OAuth2PasswordBearer password](../README.md#OAuth2PasswordBearer-password)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful Response | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## importDatabaseApiV1DatabaseImportPost

> any importDatabaseApiV1DatabaseImportPost(file)

Import Database

Import a database and images from a ZIP file. Requires an authenticated admin user. The handler rejects uploads that are not valid ZIP archives, exceed :data:&#x60;MAX_IMPORT_BYTES&#x60;, or contain entries whose resolved paths fall outside the extraction directory (zip-slip protection).

### Example

```ts
import { Configuration, DatabaseApi } from "";
import type { ImportDatabaseApiV1DatabaseImportPostRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: OAuth2PasswordBearer password
    accessToken: "YOUR ACCESS TOKEN",
  });
  const api = new DatabaseApi(config);

  const body = {
    // Blob
    file: BINARY_DATA_HERE,
  } satisfies ImportDatabaseApiV1DatabaseImportPostRequest;

  try {
    const data = await api.importDatabaseApiV1DatabaseImportPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name     | Type   | Description | Notes                     |
| -------- | ------ | ----------- | ------------------------- |
| **file** | `Blob` |             | [Defaults to `undefined`] |

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

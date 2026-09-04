# ImportApi

All URIs are relative to _http://localhost_

| Method                                                                              | HTTP request                | Description     |
| ----------------------------------------------------------------------------------- | --------------------------- | --------------- |
| [**importMalListApiV1ImportMalPost**](ImportApi.md#importmallistapiv1importmalpost) | **POST** /api/v1/import/mal | Import Mal List |

## importMalListApiV1ImportMalPost

> ImportResponse importMalListApiV1ImportMalPost(file)

Import Mal List

### Example

```ts
import { Configuration, ImportApi } from "";
import type { ImportMalListApiV1ImportMalPostRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: OAuth2PasswordBearer password
    accessToken: "YOUR ACCESS TOKEN",
  });
  const api = new ImportApi(config);

  const body = {
    // Blob
    file: BINARY_DATA_HERE,
  } satisfies ImportMalListApiV1ImportMalPostRequest;

  try {
    const data = await api.importMalListApiV1ImportMalPost(body);
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

[**ImportResponse**](ImportResponse.md)

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

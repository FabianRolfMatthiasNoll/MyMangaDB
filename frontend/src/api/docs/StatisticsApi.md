# StatisticsApi

All URIs are relative to _http://localhost_

| Method                                                                                  | HTTP request                | Description    |
| --------------------------------------------------------------------------------------- | --------------------------- | -------------- |
| [**getStatisticsApiV1StatisticsGet**](StatisticsApi.md#getstatisticsapiv1statisticsget) | **GET** /api/v1/statistics/ | Get Statistics |

## getStatisticsApiV1StatisticsGet

> Statistics getStatisticsApiV1StatisticsGet()

Get Statistics

### Example

```ts
import { Configuration, StatisticsApi } from "";
import type { GetStatisticsApiV1StatisticsGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new StatisticsApi();

  try {
    const data = await api.getStatisticsApiV1StatisticsGet();
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

[**Statistics**](Statistics.md)

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

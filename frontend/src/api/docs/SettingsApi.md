# SettingsApi

All URIs are relative to _http://localhost_

| Method                                                                                                    | HTTP request                    | Description              |
| --------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------ |
| [**createOrUpdateSettingApiV1SettingsKeyPost**](SettingsApi.md#createorupdatesettingapiv1settingskeypost) | **POST** /api/v1/settings/{key} | Create Or Update Setting |
| [**getAllSettingsApiV1SettingsGetAllGet**](SettingsApi.md#getallsettingsapiv1settingsgetallget)           | **GET** /api/v1/settings/getAll | Get All Settings         |
| [**getSettingApiV1SettingsKeyGet**](SettingsApi.md#getsettingapiv1settingskeyget)                         | **GET** /api/v1/settings/{key}  | Get Setting              |

## createOrUpdateSettingApiV1SettingsKeyPost

> any createOrUpdateSettingApiV1SettingsKeyPost(key, value, migrate)

Create Or Update Setting

### Example

```ts
import { Configuration, SettingsApi } from "";
import type { CreateOrUpdateSettingApiV1SettingsKeyPostRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SettingsApi();

  const body = {
    // string
    key: key_example,
    // string
    value: value_example,
    // boolean (optional)
    migrate: true,
  } satisfies CreateOrUpdateSettingApiV1SettingsKeyPostRequest;

  try {
    const data = await api.createOrUpdateSettingApiV1SettingsKeyPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name        | Type      | Description | Notes                            |
| ----------- | --------- | ----------- | -------------------------------- |
| **key**     | `string`  |             | [Defaults to `undefined`]        |
| **value**   | `string`  |             | [Defaults to `undefined`]        |
| **migrate** | `boolean` |             | [Optional] [Defaults to `false`] |

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

## getAllSettingsApiV1SettingsGetAllGet

> any getAllSettingsApiV1SettingsGetAllGet()

Get All Settings

### Example

```ts
import { Configuration, SettingsApi } from "";
import type { GetAllSettingsApiV1SettingsGetAllGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SettingsApi();

  try {
    const data = await api.getAllSettingsApiV1SettingsGetAllGet();
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

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getSettingApiV1SettingsKeyGet

> any getSettingApiV1SettingsKeyGet(key)

Get Setting

### Example

```ts
import { Configuration, SettingsApi } from "";
import type { GetSettingApiV1SettingsKeyGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SettingsApi();

  const body = {
    // string
    key: key_example,
  } satisfies GetSettingApiV1SettingsKeyGetRequest;

  try {
    const data = await api.getSettingApiV1SettingsKeyGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name    | Type     | Description | Notes                     |
| ------- | -------- | ----------- | ------------------------- |
| **key** | `string` |             | [Defaults to `undefined`] |

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

# AuthApi

All URIs are relative to _http://localhost_

| Method                                                                                  | HTTP request                | Description        |
| --------------------------------------------------------------------------------------- | --------------------------- | ------------------ |
| [**loginAccessTokenApiV1AuthLoginPost**](AuthApi.md#loginaccesstokenapiv1authloginpost) | **POST** /api/v1/auth/login | Login Access Token |
| [**readUsersMeApiV1AuthMeGet**](AuthApi.md#readusersmeapiv1authmeget)                   | **GET** /api/v1/auth/me     | Read Users Me      |

## loginAccessTokenApiV1AuthLoginPost

> Token loginAccessTokenApiV1AuthLoginPost(username, password, grantType, scope, clientId, clientSecret)

Login Access Token

OAuth2 compatible token login, get an access token for future requests

### Example

```ts
import { Configuration, AuthApi } from "";
import type { LoginAccessTokenApiV1AuthLoginPostRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthApi();

  const body = {
    // string
    username: username_example,
    // string
    password: password_example,
    // string (optional)
    grantType: grantType_example,
    // string (optional)
    scope: scope_example,
    // string (optional)
    clientId: clientId_example,
    // string (optional)
    clientSecret: clientSecret_example,
  } satisfies LoginAccessTokenApiV1AuthLoginPostRequest;

  try {
    const data = await api.loginAccessTokenApiV1AuthLoginPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name             | Type     | Description | Notes                                 |
| ---------------- | -------- | ----------- | ------------------------------------- |
| **username**     | `string` |             | [Defaults to `undefined`]             |
| **password**     | `string` |             | [Defaults to `undefined`]             |
| **grantType**    | `string` |             | [Optional] [Defaults to `undefined`]  |
| **scope**        | `string` |             | [Optional] [Defaults to `&#39;&#39;`] |
| **clientId**     | `string` |             | [Optional] [Defaults to `undefined`]  |
| **clientSecret** | `string` |             | [Optional] [Defaults to `undefined`]  |

### Return type

[**Token**](Token.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/x-www-form-urlencoded`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful Response | -                |
| **422**     | Validation Error    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## readUsersMeApiV1AuthMeGet

> User readUsersMeApiV1AuthMeGet()

Read Users Me

Get current user.

### Example

```ts
import { Configuration, AuthApi } from "";
import type { ReadUsersMeApiV1AuthMeGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: OAuth2PasswordBearer password
    accessToken: "YOUR ACCESS TOKEN",
  });
  const api = new AuthApi(config);

  try {
    const data = await api.readUsersMeApiV1AuthMeGet();
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

[**User**](User.md)

### Authorization

[OAuth2PasswordBearer password](../README.md#OAuth2PasswordBearer-password)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Successful Response | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

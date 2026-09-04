# UsersApi

All URIs are relative to _http://localhost_

| Method                                                                                                   | HTTP request                           | Description     |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------- | --------------- |
| [**changePasswordApiV1UsersChangePasswordPost**](UsersApi.md#changepasswordapiv1userschangepasswordpost) | **POST** /api/v1/users/change-password | Change Password |

## changePasswordApiV1UsersChangePasswordPost

> any changePasswordApiV1UsersChangePasswordPost(userUpdatePassword)

Change Password

Change password for a user. Only accessible by admin.

### Example

```ts
import {
  Configuration,
  UsersApi,
} from '';
import type { ChangePasswordApiV1UsersChangePasswordPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure OAuth2 access token for authorization: OAuth2PasswordBearer password
    accessToken: "YOUR ACCESS TOKEN",
  });
  const api = new UsersApi(config);

  const body = {
    // UserUpdatePassword
    userUpdatePassword: ...,
  } satisfies ChangePasswordApiV1UsersChangePasswordPostRequest;

  try {
    const data = await api.changePasswordApiV1UsersChangePasswordPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                   | Type                                        | Description | Notes |
| ---------------------- | ------------------------------------------- | ----------- | ----- |
| **userUpdatePassword** | [UserUpdatePassword](UserUpdatePassword.md) |             |       |

### Return type

**any**

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

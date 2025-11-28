import {
  AuthApi,
  LoginAccessTokenApiV1AuthLoginPostRequest,
  Token,
} from "../api";
import { configuration } from "./config";

const authApi = new AuthApi(configuration);

export const login = async (
  credentials: LoginAccessTokenApiV1AuthLoginPostRequest
): Promise<Token> => {
  try {
    const response = await authApi.loginAccessTokenApiV1AuthLoginPost(
      credentials
    );
    if (response.accessToken) {
      localStorage.setItem("token", response.accessToken);
    }
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token");
};

import { HTTPValidationError, ValidationError } from "../api";
import { ResponseError } from "../api/runtime";
import { logout } from "./auth";
import i18n from "../i18n";

let sessionExpiredShown = false;

export const handleApiError = async (error: unknown) => {
  const responseError = error as ResponseError;

  // Handle 401 Unauthorized / 403 Forbidden - token expired or invalid
  if (responseError.response && (responseError.response.status === 401 || responseError.response.status === 403)) {
    if (!sessionExpiredShown) {
      sessionExpiredShown = true;
      alert(i18n.t("errors.sessionExpired"));
      setTimeout(() => {
        sessionExpiredShown = false;
      }, 5000);
    }
    logout();
    return;
  }

  if (responseError.response && responseError.response.json) {
    const errorData: HTTPValidationError = await responseError.response.json();

    if (errorData && errorData.detail) {
      // If it's a simple string message
      if (typeof errorData.detail === "string") {
        alert(errorData.detail);
        return;
      }

      // If it's a validation error with an array of details
      if (Array.isArray(errorData.detail)) {
        const validationErrors = errorData.detail
          .map((err: ValidationError) => {
            const location = err.loc ? err.loc.join(" -> ") : "";
            return `${location}: ${err.msg}`;
          })
          .join("\n");

        alert(`${i18n.t("errors.validationFailed")}\n${validationErrors}`);
        return;
      }
    }
  }

  // Fallback for unknown errors
  alert(i18n.t("errors.unexpected"));
};

export const apiCallWrapper = async <T>(apiCall: () => Promise<T>, fallback: T) => {
  try {
    return await apiCall();
  } catch (error) {
    await handleApiError(error);
    return fallback;
  }
};

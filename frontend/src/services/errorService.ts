import { HTTPValidationError, ValidationError } from "../api";
import { ResponseError } from "../api/runtime";
import { logout } from "./auth";
import i18n from "../i18n";
import { notify } from "./notificationService";

let sessionExpiredShown = false;

export const handleApiError = async (error: unknown) => {
  const responseError = error as ResponseError;

  // Handle 401 Unauthorized / 403 Forbidden - token expired or invalid
  if (responseError.response && (responseError.response.status === 401 || responseError.response.status === 403)) {
    if (!sessionExpiredShown) {
      sessionExpiredShown = true;
      notify(i18n.t("errors.sessionExpired"), "error");
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
        notify(errorData.detail, "error");
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

        notify(`${i18n.t("errors.validationFailed")}\n${validationErrors}`, "error");
        return;
      }
    }
  }

  // Fallback for unknown errors
  notify(i18n.t("errors.unexpected"), "error");
};

export const apiCallWrapper = async <T>(apiCall: () => Promise<T>, fallback: T) => {
  try {
    return await apiCall();
  } catch (error) {
    await handleApiError(error);
    return fallback;
  }
};

/**
 * Like {@link apiCallWrapper}, but re-throws the error after handling it.
 *
 * Use this when the caller has to tell "the request failed" apart from "the
 * request succeeded and there is nothing to show". The fallback value of
 * `apiCallWrapper` makes a failed request indistinguishable from an empty
 * one, which is how a failed load ended up rendering an endless spinner.
 */
export const apiCallWrapperOrThrow = async <T>(
  apiCall: () => Promise<T>
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    await handleApiError(error);
    throw error;
  }
};

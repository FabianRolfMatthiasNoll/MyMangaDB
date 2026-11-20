import { HTTPValidationError, ValidationError } from "../api";
import { ResponseError } from "../api/runtime";
import { logout } from "./auth";
import i18n from "../i18n";
import { notify } from "./notificationService";

let sessionExpiredShown = false;

// The backend reports a few known problems in plain words. They get a
// proper message instead of the raw text.
const KNOWN_DETAILS: Record<string, string> = {
  "Manga already exists": "errors.mangaAlreadyExists",
};

export const handleApiError = async (error: unknown) => {
  const responseError = error as ResponseError;

  // 401 means the token is gone or invalid - the session has to end.
  if (responseError.response?.status === 401) {
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

  // 403 means the session is fine but the action is not allowed. Logging
  // the user out here would throw away a valid session because they tried
  // something they are not allowed to do.
  if (responseError.response?.status === 403) {
    notify(i18n.t("errors.notAllowed"), "error");
    return;
  }

  if (responseError.response && responseError.response.json) {
    const errorData: HTTPValidationError = await responseError.response.json();

    if (errorData && errorData.detail) {
      // If it's a simple string message
      if (typeof errorData.detail === "string") {
        const known = KNOWN_DETAILS[errorData.detail];
        notify(known ? i18n.t(known) : errorData.detail, "error");
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

        notify(
          `${i18n.t("errors.validationFailed")}\n${validationErrors}`,
          "error",
        );
        return;
      }
    }
  }

  // Fallback for unknown errors
  notify(i18n.t("errors.unexpected"), "error");
};

export const apiCallWrapper = async <T>(
  apiCall: () => Promise<T>,
  fallback: T,
) => {
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
  apiCall: () => Promise<T>,
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    await handleApiError(error);
    throw error;
  }
};

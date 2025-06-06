import { HTTPValidationError, ValidationError } from "../api";
import { ResponseError } from "../api/runtime";

export const handleApiError = async (error: unknown) => {
  const responseError = error as ResponseError;

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

        alert(`Validation failed:\n${validationErrors}`);
        return;
      }
    }
  }

  // Fallback for unknown errors
  alert("An unexpected error occurred. Please try again later.");
};

export const apiCallWrapper = async <T>(apiCall: () => Promise<T>, fallback: T) => {
  try {
    return await apiCall();
  } catch (error) {
    await handleApiError(error);
    return fallback;
  }
}; 
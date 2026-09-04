import { Configuration } from "../api";

// Empty base path keeps requests same-origin so a prebuilt image works on any
// domain; the reverse proxy forwards /api to the backend.
export const API_URL = import.meta.env.VITE_API_URL || "";

export const configuration = new Configuration({
  basePath: API_URL,
  accessToken: () => `Bearer ${localStorage.getItem("token") || ""}`,
});

export const getImageUrl = (path: string) => `${API_URL}/api/v1/images/${path}`;

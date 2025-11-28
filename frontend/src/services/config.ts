import { Configuration } from "../api";

// Debug logging
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('API Key exists:', !!import.meta.env.VITE_API_KEY);

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const API_KEY = import.meta.env.VITE_API_KEY || "";

export const configuration = new Configuration({
  basePath: API_URL,
  apiKey: API_KEY,
  headers: {
    "X-API-Key": API_KEY,
  },
});

export const getImageUrl = (path: string) => `${API_URL}/api/v1/images/${path}`;

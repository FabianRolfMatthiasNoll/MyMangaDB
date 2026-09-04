import { API_URL } from "./config";
import { ImagesApi } from "../api/apis";

const imagesApi = new ImagesApi();

/**
 * Absolute URL for a manga cover stored on the backend. The GET endpoint is
 * intentionally unauthenticated, so this string can be used directly as an
 * `<img src>` without any bearer-token plumbing.
 */
export const getMangaCoverImageUrl = (filepath: string): string => {
  if (!filepath) return "";
  return `${API_URL}/api/v1/images/manga/${filepath}`;
};

export const uploadMangaCover = async (file: File): Promise<string> => {
  try {
    const filename = `${Date.now()}_${file.name}`;
    const response = await imagesApi.saveMangaCoverApiV1ImagesMangaSavePost({
      file,
      filename,
    });
    return response.filename;
  } catch (error) {
    console.error("Error uploading manga cover:", error);
    throw error;
  }
};

export const saveMangaCover = async (
  file: File,
  customFilename?: string
): Promise<string> => {
  try {
    const filename = customFilename || `${Date.now()}_${file.name}`;
    const response = await imagesApi.saveMangaCoverApiV1ImagesMangaSavePost({
      file,
      filename,
    });
    return response.filename;
  } catch (error) {
    console.error("Error saving manga cover:", error);
    throw error;
  }
};

import { configuration, API_KEY } from "./config";
import { ImagesApi } from "../api/apis";

const imagesApi = new ImagesApi(configuration);

export const getMangaCoverImageUrl = (filepath: string): string => {
  if (!filepath) return "";
  return `${import.meta.env.VITE_API_URL}/api/v1/images/manga/${filepath}`;
};

export const fetchMangaCoverImageAsBlobUrl = async (filepath: string): Promise<string> => {
    if (!filepath) return "";
    const imageUrl = getMangaCoverImageUrl(filepath);
    try {
        const response = await fetch(imageUrl, {
            headers: {
                "X-API-Key": API_KEY,
            },
        });

        if (!response.ok) {
            // check for 404 and return specific message or empty string
            if (response.status === 404) {
                return ""; // or a path to a placeholder image
            }
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        return objectUrl;
    } catch (error) {
        console.error("Error fetching manga cover:", error);
        return ""; // return a default/empty string on error
    }
};

export const uploadMangaCover = async (file: File): Promise<string> => {
  try {
    const filename = `${Date.now()}_${file.name}`;
    const response = await imagesApi.saveMangaCoverApiV1ImagesMangaSavePost({ file, filename });
    return response.filename;
  } catch (error) {
    console.error("Error uploading manga cover:", error);
    throw error;
  }
};

export const saveMangaCover = async (file: File, customFilename?: string): Promise<string> => {
  try {
    const filename = customFilename || `${Date.now()}_${file.name}`;
    const response = await imagesApi.saveMangaCoverApiV1ImagesMangaSavePost({ file, filename });
    return response.filename;
  } catch (error) {
    console.error("Error saving manga cover:", error);
    throw error;
  }
};

import { API_BASE_URL, getImageUrl } from "./config";

export const getMangaCoverImageUrl = (filepath: string) =>
  getImageUrl(`manga/${filepath}`);

export const uploadMangaCover = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/images/manga/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.filename;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const saveMangaCover = async (file: File, filename: string): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('filename', filename);

  const response = await fetch(`${API_BASE_URL}/api/v1/images/manga/save`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to save cover image');
  }

  const result = await response.json();
  if (!result.filename) {
    throw new Error('Failed to get filename from server');
  }

  return result.filename;
}; 
import { configuration, API_URL } from "./config";
import { ImagesApi } from "../api/apis";

const imagesApi = new ImagesApi(configuration);

/**
 * Build the absolute URL for a volume cover stored on the backend. The GET
 * endpoint is intentionally unauthenticated, so this can be used directly
 * as an `<img src>` without any bearer-token plumbing.
 */
export const getVolumeCoverImageUrl = (filepath: string): string => {
  if (!filepath) return "";
  return `${API_URL}/api/v1/images/volume/${filepath}`;
};

/**
 * Upload a per-volume cover image. The filename is randomised on the
 * client (UUID + original extension) to avoid collisions on disk; the
 * backend only stores the returned sanitised filename.
 */
export const uploadVolumeCover = async (
  mangaId: number,
  volumeId: number,
  file: File
): Promise<string> => {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "jpg";
  const filename = `${crypto.randomUUID()}.${safeExt}`;
  const response = await imagesApi.saveVolumeCoverApiV1ImagesVolumeMangaIdVolumeIdPut(
    {
      mangaId,
      volumeId,
      file,
      filename,
    }
  );
  return response.filename;
};

/**
 * Remove a volume's cover (file + DB column null).
 */
export const removeVolumeCover = async (
  mangaId: number,
  volumeId: number
): Promise<void> => {
  await imagesApi.removeVolumeCoverApiV1ImagesVolumeMangaIdVolumeIdDelete({
    mangaId,
    volumeId,
  });
};

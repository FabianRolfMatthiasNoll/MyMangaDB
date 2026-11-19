import { render, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MobileMangaListItem from "./MobileMangaListItem";
import { fetchMangaCoverImageAsBlobUrl } from "../services/imageService";
import { Manga } from "../api/models";

vi.mock("../services/imageService", () => ({
  fetchMangaCoverImageAsBlobUrl: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const manga: Manga = {
  id: 1,
  title: "Test Manga",
  japaneseTitle: null,
  readingStatus: "in_progress",
  overallStatus: "ongoing",
  starRating: null,
  language: "EN",
  category: "manga",
  summary: null,
  coverImage: "cover.jpg",
  authors: [],
  genres: [],
  lists: [],
  volumes: [],
};

describe("MobileMangaListItem cover image", () => {
  const createObjectURL = vi.fn(() => "blob:cover");
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    vi.mocked(fetchMangaCoverImageAsBlobUrl).mockResolvedValue("blob:cover");
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
    // jsdom does not implement the object URL API.
    Object.defineProperty(URL, "createObjectURL", {
      value: createObjectURL,
      writable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: revokeObjectURL,
      writable: true,
    });
  });

  afterEach(() => {
    vi.mocked(fetchMangaCoverImageAsBlobUrl).mockReset();
  });

  it("revokes the object URL when the component unmounts", async () => {
    const { unmount } = render(
      <BrowserRouter>
        <MobileMangaListItem manga={manga} />
      </BrowserRouter>
    );

    await waitFor(() =>
      expect(fetchMangaCoverImageAsBlobUrl).toHaveBeenCalledWith("cover.jpg")
    );

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:cover");
  });

  it("revokes the previous object URL when the cover changes", async () => {
    const { rerender } = render(
      <BrowserRouter>
        <MobileMangaListItem manga={manga} />
      </BrowserRouter>
    );

    await waitFor(() =>
      expect(fetchMangaCoverImageAsBlobUrl).toHaveBeenCalledWith("cover.jpg")
    );

    rerender(
      <BrowserRouter>
        <MobileMangaListItem
          manga={{ ...manga, coverImage: "other-cover.jpg" }}
        />
      </BrowserRouter>
    );

    await waitFor(() =>
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:cover")
    );
  });
});

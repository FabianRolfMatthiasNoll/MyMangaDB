import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import WishlistPage from "./WishlistPage";
import { getWishlistMangas } from "../services/wishlistService";
import { Manga, Volume } from "../api/models";

vi.mock("../services/wishlistService", () => ({
  getWishlistMangas: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

vi.mock("../context/UserContext", () => ({
  useUser: () => ({
    user: null,
    loading: false,
    isAdmin: true,
    refreshUser: vi.fn(),
  }),
}));

const volume = (volumeNumber: string): Volume => ({
  id: Number(volumeNumber),
  mangaId: 1,
  volumeNumber,
  coverImage: null,
});

const wishlistEntry = (
  id: number,
  title: string,
  volumes: string[],
  totalVolumes?: number
): Manga => ({
  id,
  title,
  japaneseTitle: null,
  readingStatus: "not_started",
  overallStatus: "ongoing",
  starRating: null,
  language: "EN",
  category: "manga",
  summary: null,
  coverImage: null,
  ownershipStatus: "wishlist",
  priority: false,
  addedAt: new Date("2026-11-19T10:00:00Z"),
  totalVolumes: totalVolumes ?? null,
  authors: [],
  genres: [],
  lists: [],
  volumes: volumes.map(volume),
});

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <WishlistPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("WishlistPage", () => {
  beforeEach(() => {
    vi.mocked(getWishlistMangas).mockReset();
  });

  it("shows a helpful message when the wishlist is empty", async () => {
    vi.mocked(getWishlistMangas).mockResolvedValue([]);

    renderPage();

    await waitFor(() => expect(screen.getByText("wishlist.empty")).toBeTruthy());
  });

  it("shows the two sections", async () => {
    vi.mocked(getWishlistMangas).mockResolvedValue([
      wishlistEntry(1, "Half Done", ["1", "2", "5"]),
    ]);

    renderPage();

    await waitFor(() =>
      expect(screen.getByText("wishlist.continueSeries")).toBeTruthy()
    );
    expect(screen.getByText("wishlist.newToBuy")).toBeTruthy();
  });

  it("shows the recently added wishes as a strip", async () => {
    vi.mocked(getWishlistMangas).mockResolvedValue([
      wishlistEntry(1, "Brand New", []),
    ]);

    renderPage();

    await waitFor(() =>
      expect(screen.getByText("wishlist.recentlyAdded")).toBeTruthy()
    );
  });

  it("shows the missing volumes of a partially owned series", async () => {
    vi.mocked(getWishlistMangas).mockResolvedValue([
      wishlistEntry(1, "Half Done", ["1", "2", "5"]),
    ]);

    renderPage();

    await waitFor(() => expect(screen.getByText("Half Done")).toBeTruthy());
    // It is missing volumes 3 and 4.
    expect(screen.getByText("wishlist.missingVolumes")).toBeTruthy();
  });

  it("does not show a volume strip for a title without volumes", async () => {
    vi.mocked(getWishlistMangas).mockResolvedValue([
      wishlistEntry(2, "Brand New", []),
    ]);

    renderPage();

    await waitFor(() => expect(screen.getByText("Brand New")).toBeTruthy());
    // Nothing is owned, so there is nothing missing either.
    expect(screen.queryByText("wishlist.missingVolumes")).toBeNull();
  });

  it("shows how many titles are on the wishlist", async () => {
    vi.mocked(getWishlistMangas).mockResolvedValue([
      wishlistEntry(1, "One", []),
      wishlistEntry(2, "Two", []),
    ]);

    renderPage();

    await waitFor(() => expect(screen.getByText("wishlist.count")).toBeTruthy());
  });

  it("shows an error when the wishlist cannot be loaded", async () => {
    vi.mocked(getWishlistMangas).mockRejectedValue(new Error("boom"));

    renderPage();

    await waitFor(() =>
      expect(screen.getByText("common.errorLoading")).toBeTruthy()
    );
  });
});

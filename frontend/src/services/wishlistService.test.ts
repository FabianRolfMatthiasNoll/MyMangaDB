import { beforeEach, describe, expect, it, vi } from "vitest";
import { Manga, OwnershipStatus } from "../api/models";
import {
  addVolumesToCollection,
  completeSeries,
  removeFromWishlist,
  setOwnershipStatus,
  setPriority,
} from "./wishlistService";
import { deleteManga, updateMangaDetails } from "./mangaService";

vi.mock("./mangaService", () => ({
  deleteManga: vi.fn(),
  getMangas: vi.fn(),
  updateMangaDetails: vi.fn(),
}));

const manga = (volumes: string[] = []): Manga => ({
  id: 7,
  title: "A Series",
  japaneseTitle: null,
  readingStatus: "not_started",
  overallStatus: "ongoing",
  starRating: null,
  language: "EN",
  category: "manga",
  summary: null,
  coverImage: null,
  ownershipStatus: OwnershipStatus.Wishlist,
  priority: false,
  addedAt: new Date("2026-11-19T10:00:00Z"),
  totalVolumes: null,
  authors: [],
  genres: [],
  lists: [],
  volumes: volumes.map((volumeNumber) => ({
    id: Number(volumeNumber),
    mangaId: 7,
    volumeNumber,
    coverImage: null,
  })),
});

describe("wishlistService", () => {
  beforeEach(() => {
    vi.mocked(updateMangaDetails).mockReset();
    vi.mocked(deleteManga).mockReset();
    vi.mocked(updateMangaDetails).mockImplementation(async (manga) => manga);
  });

  it("marks a title as owned", async () => {
    const entry = manga();

    await setOwnershipStatus(entry, OwnershipStatus.Owned);

    expect(updateMangaDetails).toHaveBeenCalledWith(
      expect.objectContaining({ ownershipStatus: OwnershipStatus.Owned }),
    );
  });

  it("marks a title as ordered", async () => {
    const entry = manga();

    await setOwnershipStatus(entry, OwnershipStatus.Ordered);

    expect(updateMangaDetails).toHaveBeenCalledWith(
      expect.objectContaining({ ownershipStatus: OwnershipStatus.Ordered }),
    );
  });

  it("sets and clears the priority", async () => {
    const entry = manga();

    await setPriority(entry, true);
    expect(updateMangaDetails).toHaveBeenLastCalledWith(
      expect.objectContaining({ priority: true }),
    );

    await setPriority(entry, false);
    expect(updateMangaDetails).toHaveBeenLastCalledWith(
      expect.objectContaining({ priority: false }),
    );
  });

  it("adds the missing volumes when a series is completed", async () => {
    const entry = manga(["1", "2", "5"]);

    await completeSeries(entry);

    const sent = vi.mocked(updateMangaDetails).mock.calls[0][0];
    expect(sent.ownershipStatus).toBe(OwnershipStatus.Owned);
    expect(sent.volumes.map((volume) => volume.volumeNumber)).toEqual([
      "1",
      "2",
      "5",
      "3",
      "4",
    ]);
  });

  it("does not add volumes that are already owned", async () => {
    const entry = manga(["1", "2", "3"]);

    await completeSeries(entry);

    const sent = vi.mocked(updateMangaDetails).mock.calls[0][0];
    expect(sent.volumes).toHaveLength(3);
  });

  it("removes a title from the wishlist", async () => {
    const entry = manga();

    await removeFromWishlist(entry);

    expect(deleteManga).toHaveBeenCalledWith(entry.id);
  });

  it("moves received volumes into the collection", async () => {
    const entry = manga(["1"]);

    await addVolumesToCollection(entry, [2, 3, 4, 5]);

    const sent = vi.mocked(updateMangaDetails).mock.calls[0][0];
    expect(sent.volumes.map((volume) => volume.volumeNumber)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
    ]);
    // The rest of the series is still wanted.
    expect(sent.ownershipStatus).toBe(OwnershipStatus.Wishlist);
  });

  it("does not add volumes that are already owned", async () => {
    const entry = manga(["1", "2"]);

    await addVolumesToCollection(entry, [2, 3]);

    const sent = vi.mocked(updateMangaDetails).mock.calls[0][0];
    expect(sent.volumes.map((volume) => volume.volumeNumber)).toEqual([
      "1",
      "2",
      "3",
    ]);
  });

  it("leaves the wishlist when the last missing volume arrives", async () => {
    const entry = { ...manga(["1"]), totalVolumes: 2 };

    await addVolumesToCollection(entry, [2]);

    const sent = vi.mocked(updateMangaDetails).mock.calls[0][0];
    expect(sent.ownershipStatus).toBe(OwnershipStatus.Owned);
  });

  it("fails when the title could not be updated", async () => {
    vi.mocked(updateMangaDetails).mockResolvedValue(null);

    await expect(
      setOwnershipStatus(manga(), OwnershipStatus.Owned),
    ).rejects.toThrow();
  });
});

import { describe, expect, it } from "vitest";
import { Manga, Volume } from "../api/models";
import {
  formatVolumeRange,
  isPartiallyOwned,
  isUnowned,
  missingVolumeCount,
  missingVolumesOf,
  ownedVolumesOf,
  seriesVolumesOf,
} from "./wishlist";

const volume = (volumeNumber: string): Volume => ({
  id: Number(volumeNumber),
  mangaId: 1,
  volumeNumber,
  coverImage: null,
});

const mangaWith = (volumes: string[], totalVolumes?: number): Manga => ({
  id: 1,
  title: "A Series",
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
  addedAt: null,
  totalVolumes: totalVolumes ?? null,
  authors: [],
  genres: [],
  lists: [],
  volumes: volumes.map(volume),
});

describe("ownedVolumesOf", () => {
  it("returns the owned volume numbers in order", () => {
    expect(ownedVolumesOf(mangaWith(["3", "1", "2"]))).toEqual([1, 2, 3]);
  });

  it("ignores volume numbers that are not numbers", () => {
    expect(ownedVolumesOf(mangaWith(["1", "extra", "2"]))).toEqual([1, 2]);
  });

  it("returns nothing for a title without volumes", () => {
    expect(ownedVolumesOf(mangaWith([]))).toEqual([]);
  });
});

describe("missingVolumesOf", () => {
  it("finds the gap in a partially owned series", () => {
    expect(missingVolumesOf(mangaWith(["1", "2", "5"]))).toEqual([3, 4]);
  });

  it("uses the total number of volumes when it is known", () => {
    expect(missingVolumesOf(mangaWith(["1", "2"], 5))).toEqual([3, 4, 5]);
  });

  it("returns nothing when every volume up to the highest is owned", () => {
    expect(missingVolumesOf(mangaWith(["1", "2", "3"]))).toEqual([]);
  });

  it("returns nothing for a title without any volumes", () => {
    expect(missingVolumesOf(mangaWith([]))).toEqual([]);
  });
});

describe("seriesVolumesOf", () => {
  it("runs up to the total number of volumes", () => {
    expect(seriesVolumesOf(mangaWith(["1"], 3))).toEqual([1, 2, 3]);
  });

  it("runs up to the highest owned volume without a known total", () => {
    expect(seriesVolumesOf(mangaWith(["1", "3"]))).toEqual([1, 2, 3]);
  });

  it("is empty for a title without any volumes", () => {
    expect(seriesVolumesOf(mangaWith([]))).toEqual([]);
  });
});

describe("isPartiallyOwned and isUnowned", () => {
  it("recognises a partially owned series", () => {
    expect(isPartiallyOwned(mangaWith(["1", "2", "5"]))).toBe(true);
    expect(isPartiallyOwned(mangaWith(["1", "2", "3"]))).toBe(false);
    expect(isPartiallyOwned(mangaWith([]))).toBe(false);
  });

  it("recognises a title nothing is owned of", () => {
    expect(isUnowned(mangaWith([]))).toBe(true);
    expect(isUnowned(mangaWith(["1"]))).toBe(false);
  });
});

describe("missingVolumeCount", () => {
  it("counts the missing volumes", () => {
    expect(missingVolumeCount(mangaWith(["1", "2", "5"]))).toBe(2);
    expect(missingVolumeCount(mangaWith(["1", "2"], 27))).toBe(25);
  });
});

describe("formatVolumeRange", () => {
  it("formats a single volume", () => {
    expect(formatVolumeRange([3])).toBe("3");
  });

  it("formats a range", () => {
    expect(formatVolumeRange([3, 4, 5])).toBe("3-5");
  });

  it("formats several ranges", () => {
    expect(formatVolumeRange([1, 2, 5, 6, 9])).toBe("1-2, 5-6, 9");
  });

  it("formats nothing", () => {
    expect(formatVolumeRange([])).toBe("");
  });
});

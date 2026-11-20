import { Manga } from "../api/models";

/**
 * The volume numbers a manga owns, in ascending order.
 */
export const ownedVolumesOf = (manga: Manga): number[] =>
  manga.volumes
    .map((volume) => parseInt(volume.volumeNumber, 10))
    .filter((number) => !isNaN(number))
    .sort((a, b) => a - b);

/**
 * The volumes of a series that are still missing.
 *
 * The series runs up to its total number of volumes when that is known.
 * Otherwise it runs up to the highest volume that is already owned - a
 * series with a gap shows that gap, a series without one shows nothing.
 */
export const missingVolumesOf = (manga: Manga): number[] => {
  const owned = ownedVolumesOf(manga);
  const lastKnown =
    manga.totalVolumes ?? (owned.length > 0 ? owned[owned.length - 1] : 0);

  const missing: number[] = [];
  for (let number = 1; number <= lastKnown; number += 1) {
    if (!owned.includes(number)) {
      missing.push(number);
    }
  }
  return missing;
};

/**
 * The volumes a series consists of - the ones that are owned plus the ones
 * that are missing.
 */
export const seriesVolumesOf = (manga: Manga): number[] => {
  const owned = ownedVolumesOf(manga);
  const lastKnown =
    manga.totalVolumes ?? (owned.length > 0 ? owned[owned.length - 1] : 0);
  return Array.from({ length: lastKnown }, (_, index) => index + 1);
};

/**
 * How many volumes of the series are still missing.
 */
export const missingVolumeCount = (manga: Manga): number =>
  missingVolumesOf(manga).length;

/**
 * Whether the series can be continued - some volumes are owned and some are
 * still missing.
 */
export const isPartiallyOwned = (manga: Manga): boolean =>
  ownedVolumesOf(manga).length > 0 && missingVolumesOf(manga).length > 0;

/**
 * Whether nothing of the series is owned yet.
 */
export const isUnowned = (manga: Manga): boolean =>
  ownedVolumesOf(manga).length === 0;

/**
 * A readable range of volume numbers, e.g. "3-5" or "3".
 */
export const formatVolumeRange = (volumes: number[]): string => {
  if (volumes.length === 0) {
    return "";
  }

  const ranges: string[] = [];
  let start = volumes[0];
  let previous = volumes[0];

  for (let index = 1; index <= volumes.length; index += 1) {
    const current = volumes[index];
    if (current === previous + 1) {
      previous = current;
      continue;
    }
    ranges.push(start === previous ? `${start}` : `${start}-${previous}`);
    start = current;
    previous = current;
  }

  return ranges.join(", ");
};

/**
 * How long ago something happened, e.g. "3 days ago".
 *
 * Returns an empty string when the date is unknown.
 */
export const formatRelativeDate = (
  date: string | Date | null | undefined,
  locale?: string
): string => {
  if (!date) {
    return "";
  }

  const timestamp = new Date(date).getTime();
  if (isNaN(timestamp)) {
    return "";
  }

  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return formatter.format(Math.round(seconds / size), unit);
    }
  }

  return formatter.format(seconds, "second");
};

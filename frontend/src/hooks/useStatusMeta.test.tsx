import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useStatusMeta } from "./useStatusMeta";
import { OverallStatus, ReadingStatus } from "../api/models";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("useStatusMeta", () => {
  it("translates every reading status", () => {
    const { result } = renderHook(() => useStatusMeta());

    expect(result.current.getStatusLabel(ReadingStatus.NotStarted)).toBe(
      "status.notStarted"
    );
    expect(result.current.getStatusLabel(ReadingStatus.InProgress)).toBe(
      "status.reading"
    );
    expect(result.current.getStatusLabel(ReadingStatus.Completed)).toBe(
      "status.completed"
    );
    expect(result.current.getStatusLabel(ReadingStatus.OnHold)).toBe(
      "status.onHold"
    );
    expect(result.current.getStatusLabel(ReadingStatus.Dropped)).toBe(
      "status.dropped"
    );
  });

  it("translates every overall status", () => {
    const { result } = renderHook(() => useStatusMeta());

    expect(result.current.getStatusLabel(OverallStatus.Ongoing)).toBe(
      "status.ongoing"
    );
    expect(result.current.getStatusLabel(OverallStatus.Completed)).toBe(
      "status.completed"
    );
    expect(result.current.getStatusLabel(OverallStatus.Hiatus)).toBe(
      "status.hiatus"
    );
    expect(result.current.getStatusLabel(OverallStatus.Cancelled)).toBe(
      "status.cancelled"
    );
  });

  it("gives every known status a colour", () => {
    const { result } = renderHook(() => useStatusMeta());

    const known = [
      ...Object.values(ReadingStatus),
      ...Object.values(OverallStatus),
    ];

    for (const status of known) {
      // The fallback for an unknown status is the grey palette entry, so a
      // known status has to resolve to something else.
      expect(result.current.getStatusColor(status)).not.toBe(
        result.current.getStatusColor("something-unknown")
      );
    }
  });

  it("falls back to the raw value for an unknown status", () => {
    const { result } = renderHook(() => useStatusMeta());

    expect(result.current.getStatusLabel("something-unknown")).toBe(
      "something-unknown"
    );
    expect(result.current.getStatusLabel(undefined)).toBe("");
    expect(result.current.getStatusLabel(null)).toBe("");
  });
});

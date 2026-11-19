import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useOwnershipStatus } from "./useOwnershipStatus";
import { OwnershipStatus } from "../api/models";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("useOwnershipStatus", () => {
  it("translates every ownership state", () => {
    const { result } = renderHook(() => useOwnershipStatus());

    expect(result.current.getOwnershipLabel(OwnershipStatus.Owned)).toBe(
      "ownership.owned"
    );
    expect(result.current.getOwnershipLabel(OwnershipStatus.Wishlist)).toBe(
      "ownership.wishlist"
    );
    expect(result.current.getOwnershipLabel(OwnershipStatus.Ordered)).toBe(
      "ownership.ordered"
    );
  });

  it("falls back to owned when the state is unknown", () => {
    const { result } = renderHook(() => useOwnershipStatus());

    expect(result.current.getOwnershipLabel(undefined)).toBe("ownership.owned");
    expect(result.current.getOwnershipLabel(null)).toBe("ownership.owned");
  });

  it("gives every state its own colour", () => {
    const { result } = renderHook(() => useOwnershipStatus());

    const colors = [
      result.current.getOwnershipColor(OwnershipStatus.Owned),
      result.current.getOwnershipColor(OwnershipStatus.Wishlist),
      result.current.getOwnershipColor(OwnershipStatus.Ordered),
    ];

    expect(new Set(colors).size).toBe(3);
  });
});

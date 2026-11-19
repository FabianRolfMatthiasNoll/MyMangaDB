import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Dashboard from "./Dashboard";
import { getMangas } from "../services/mangaService";

vi.mock("../services/mangaService", () => ({
  getMangas: vi.fn().mockResolvedValue([]),
}));

vi.mock("../services/listService", () => ({
  getAllLists: vi.fn().mockResolvedValue([{ id: 7, name: "Shelf" }]),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../components/SearchBar", () => ({
  default: ({ toggleAdvancedFilters }: { toggleAdvancedFilters: () => void }) => (
    <button onClick={toggleAdvancedFilters}>Advanced filters</button>
  ),
}));

vi.mock("../components/AdvancedFilters", () => ({
  default: ({
    setFilterCategory,
    setFilterReadingStatus,
    setFilterOverallStatus,
    setRatingRange,
    setFilterList,
    setFilterOwnershipStatus,
    onToggleWishlist,
  }: {
    setFilterCategory: (value: string[]) => void;
    setFilterReadingStatus: (value: string[]) => void;
    setFilterOverallStatus: (value: string[]) => void;
    setRatingRange: (value: number[]) => void;
    setFilterList: (value: { id: number; name: string } | null) => void;
    setFilterOwnershipStatus: (value: string[]) => void;
    onToggleWishlist: () => void;
  }) => (
    <>
      <button onClick={() => setFilterCategory(["manga"])}>Category</button>
      <button onClick={() => setFilterReadingStatus(["in_progress"])}>
        Reading status
      </button>
      <button onClick={() => setFilterOverallStatus(["ongoing"])}>
        Overall status
      </button>
      <button onClick={() => setRatingRange([4, 5])}>Rating</button>
      <button onClick={() => setFilterList({ id: 7, name: "Shelf" })}>
        List
      </button>
      <button onClick={() => setFilterOwnershipStatus(["wishlist"])}>
        Ownership
      </button>
      <button onClick={onToggleWishlist}>Toggle wishlist</button>
    </>
  ),
}));

vi.mock("../components/MangaList", () => ({ default: () => null }));
vi.mock("../components/AutomaticSearchModal", () => ({ default: () => null }));
vi.mock("react-infinite-scroll-component", () => ({ default: ({ children }: { children: React.ReactNode }) => children }));

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    </BrowserRouter>,
  );
}

describe("Dashboard advanced filters", () => {
  beforeEach(() => {
    vi.mocked(getMangas).mockClear();
  });

  it("refetches manga data with every advanced filter", async () => {
    renderDashboard();

    await waitFor(() => expect(getMangas).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Advanced filters" }));

    fireEvent.click(screen.getByRole("button", { name: "Category" }));
    await waitFor(() => expect(getMangas).toHaveBeenLastCalledWith({
          page: 1,
          limit: 20,
          search: "",
          sort: "asc",
          categories: ["manga"],
          ratingMin: 0,
          ratingMax: 5,
          ownershipStatuses: ["owned", "ordered"],
        }));

    fireEvent.click(screen.getByRole("button", { name: "Reading status" }));
    await waitFor(() => expect(getMangas).toHaveBeenLastCalledWith({
          page: 1,
          limit: 20,
          search: "",
          sort: "asc",
          categories: ["manga"],
          readingStatuses: ["in_progress"],
          ratingMin: 0,
          ratingMax: 5,
          ownershipStatuses: ["owned", "ordered"],
        }));

    fireEvent.click(screen.getByRole("button", { name: "Overall status" }));
    await waitFor(() => expect(getMangas).toHaveBeenLastCalledWith({
          page: 1,
          limit: 20,
          search: "",
          sort: "asc",
          categories: ["manga"],
          readingStatuses: ["in_progress"],
          overallStatuses: ["ongoing"],
          ratingMin: 0,
          ratingMax: 5,
          ownershipStatuses: ["owned", "ordered"],
        }));

    fireEvent.click(screen.getByRole("button", { name: "Rating" }));
    await waitFor(() => expect(getMangas).toHaveBeenLastCalledWith({
          page: 1,
          limit: 20,
          search: "",
          sort: "asc",
          categories: ["manga"],
          readingStatuses: ["in_progress"],
          overallStatuses: ["ongoing"],
          ratingMin: 4,
          ratingMax: 5,
          ownershipStatuses: ["owned", "ordered"],
        }));
  });

  it("filters by list id instead of smuggling the list into the search", async () => {
    renderDashboard();

    await waitFor(() => expect(getMangas).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Advanced filters" }));

    fireEvent.click(screen.getByRole("button", { name: "List" }));

    await waitFor(() =>
      expect(getMangas).toHaveBeenLastCalledWith({
        page: 1,
        limit: 20,
        search: "",
        sort: "asc",
        ratingMin: 0,
        ratingMax: 5,
        listId: 7,
        ownershipStatuses: ["owned", "ordered"],
      })
    );
  });

  it("filters by ownership status", async () => {
    renderDashboard();

    await waitFor(() => expect(getMangas).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Advanced filters" }));

    fireEvent.click(screen.getByRole("button", { name: "Ownership" }));

    await waitFor(() =>
      expect(getMangas).toHaveBeenLastCalledWith({
        page: 1,
        limit: 20,
        search: "",
        sort: "asc",
        ratingMin: 0,
        ratingMax: 5,
        ownershipStatuses: ["wishlist"],
      })
    );
  });

  it("keeps the wishlist out of the collection by default", async () => {
    renderDashboard();

    await waitFor(() => expect(getMangas).toHaveBeenCalled());

    expect(getMangas).toHaveBeenLastCalledWith(
      expect.objectContaining({
        ownershipStatuses: ["owned", "ordered"],
      })
    );
  });

  it("shows the wishlist in the collection when it is switched on", async () => {
    renderDashboard();

    await waitFor(() => expect(getMangas).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Advanced filters" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle wishlist" }));

    await waitFor(() =>
      expect(getMangas).toHaveBeenLastCalledWith(
        expect.objectContaining({ ownershipStatuses: undefined })
      )
    );
  });
});

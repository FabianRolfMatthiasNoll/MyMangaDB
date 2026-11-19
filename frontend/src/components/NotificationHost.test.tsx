import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotificationHost from "./NotificationHost";
import { notify } from "../services/notificationService";

describe("NotificationHost", () => {
  it("shows a published notification", async () => {
    render(<NotificationHost />);

    notify("Something went wrong", "error");

    await waitFor(() =>
      expect(screen.getByText("Something went wrong")).toBeTruthy()
    );
  });

  it("shows the notifications one after another", async () => {
    render(<NotificationHost />);

    notify("First");
    notify("Second");

    await waitFor(() => expect(screen.getByText("First")).toBeTruthy());
    // The second one waits until the first has been dismissed.
    expect(screen.queryByText("Second")).toBeNull();
  });

  it("renders nothing when there is no notification", () => {
    render(<NotificationHost />);

    expect(screen.queryByRole("alert")).toBeNull();
  });
});

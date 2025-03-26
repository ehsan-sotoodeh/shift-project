// __tests__/pages/FavoritesPage.test.tsx
import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import FavoritesPage from "../../src/app/favorites/page"; // Adjust path as needed
import "@testing-library/jest-dom";

// Mock AuthContext so that useAuth returns a dummy user.
jest.mock("../../src/app/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user", name: "Test User" },
    // Add any other properties if needed.
    loading: false,
  }),
}));

// Also, mock next/navigation to provide a dummy router.
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe("FavoritesPage Component", () => {
  // Updated favorites response including pagination fields.
  const favoritesResponse = {
    data: [
      {
        id: 1,
        university: {
          name: "University A",
          stateProvince: "State A",
          website: "http://university-a.com",
        },
      },
      {
        id: 2,
        university: {
          name: "University B",
          stateProvince: "State B",
          website: "http://university-b.com",
        },
      },
    ],
    total: 2,
    page: 1,
    pageSize: 10,
  };

  beforeEach(() => {
    global.fetch = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test("shows loading initially and then displays favorites", async () => {
    // Simulate a successful fetch returning favorites with pagination.
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => favoritesResponse,
    });

    render(<FavoritesPage />);

    // Check that the loading indicator is displayed initially.
    expect(screen.getByText(/Loading favorites/i)).toBeInTheDocument();

    // Wait for the favorites to load and be displayed.
    expect(await screen.findByText("University A")).toBeInTheDocument();
    expect(screen.getByText("University B")).toBeInTheDocument();

    // Ensure the table is rendered.
    expect(screen.getByRole("table")).toBeInTheDocument();

    // Verify the pagination text is rendered (e.g., "Page 1 of 1").
    expect(screen.getByText(/Page 1 of 1/i)).toBeInTheDocument();

    // Verify the "Back to Search" link is present.
    expect(screen.getByText("Back to Search")).toBeInTheDocument();
  });

  test("displays a message when no favorites are returned", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ data: [], total: 0, page: 1, pageSize: 10 }),
    });

    render(<FavoritesPage />);
    // Wait for the empty state message.
    expect(
      await screen.findByText("No favorites added yet.")
    ).toBeInTheDocument();
  });

  test("handles error in fetching favorites gracefully", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Fetch error"));

    render(<FavoritesPage />);

    // Wait until the loading indicator is gone.
    await waitFor(() => {
      expect(screen.queryByText(/Loading favorites/i)).not.toBeInTheDocument();
    });
    // Verify that an error is logged.
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching favorites:",
      expect.any(Error)
    );
  });

  test("removes a favorite when the remove button is clicked", async () => {
    // First call: fetch favorites; Second call: DELETE favorite (simulate success).
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => favoritesResponse,
      })
      .mockResolvedValueOnce({
        json: async () => ({ statusCode: 200 }),
      });

    render(<FavoritesPage />);

    // Wait for favorites to load.
    expect(await screen.findByText("University A")).toBeInTheDocument();

    // Locate the table row that contains "University A".
    const row = screen.getByText("University A").closest("tr");
    expect(row).toBeInTheDocument();

    // Use 'within' to find the remove button in that row.
    const removeButton = within(row!).getByRole("button");
    fireEvent.click(removeButton);

    // Wait for the favorite to be removed.
    await waitFor(() => {
      expect(screen.queryByText("University A")).not.toBeInTheDocument();
    });

    // Verify that DELETE was called with the proper URL.
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/favorites?id=1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  test("handles error when removing a favorite gracefully", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    // First call: fetch favorites (one favorite returned).
    const oneFavoriteResponse = {
      data: [
        {
          id: 1,
          university: {
            name: "University A",
            stateProvince: "State A",
            website: "http://university-a.com",
          },
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
    };
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => oneFavoriteResponse,
      })
      // Second call: DELETE favorite fails.
      .mockRejectedValueOnce(new Error("Delete error"));

    render(<FavoritesPage />);

    // Wait for the favorite to load.
    expect(await screen.findByText("University A")).toBeInTheDocument();

    // Locate the row and then find the remove button.
    const row = screen.getByText("University A").closest("tr");
    expect(row).toBeInTheDocument();
    const removeButton = within(row!).getByRole("button");
    fireEvent.click(removeButton);

    // Wait for the error to be logged.
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error removing favorite:",
        expect.any(Error)
      );
    });
    // Ensure that the favorite is still displayed.
    expect(screen.getByText("University A")).toBeInTheDocument();
  });
});

// __tests__/pages/FavoritesPage.test.tsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import FavoritesPage from "../../src/app/favorites/page"; // Adjust path as needed
import "@testing-library/jest-dom";

describe("FavoritesPage Component", () => {
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
    // Simulate a successful fetch returning favorites
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

    // Verify the "Back to Search" link is present.
    expect(screen.getByText("Back to Search")).toBeInTheDocument();
  });

  test("displays a message when no favorites are returned", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ data: [] }),
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

    // Wait for the fetch to complete so that loading is hidden.
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
    // First call: fetch favorites
    // Second call: DELETE favorite (simulate success)
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

    // Get the remove button for University A.
    const removeButtons = screen.getAllByRole("button", {
      name: /Remove from Favorites/i,
    });
    const removeButton = removeButtons[0];
    fireEvent.click(removeButton);

    // Wait for the favorite to be removed.
    await waitFor(() => {
      expect(screen.queryByText("University A")).not.toBeInTheDocument();
    });
  });

  test("handles error when removing a favorite gracefully", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    // First call: fetch favorites (one favorite returned)
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
    };
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => oneFavoriteResponse,
      })
      // Second call: DELETE favorite fails
      .mockRejectedValueOnce(new Error("Delete error"));

    render(<FavoritesPage />);

    // Wait for the favorite to load.
    expect(await screen.findByText("University A")).toBeInTheDocument();

    // Click the remove button.
    const removeButton = screen.getByRole("button", {
      name: /Remove from Favorites/i,
    });
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

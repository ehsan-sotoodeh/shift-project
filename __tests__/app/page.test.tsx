import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchPage from "../../src/app/page";
import "@testing-library/jest-dom";

// --- MOCK TOAST ---
// This will allow us to track calls to toast.success and toast.error.
const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();
jest.mock("react-hot-toast", () => ({
  success: (...args) => toastSuccessMock(...args),
  error: (...args) => toastErrorMock(...args),
}));

describe("SearchPage Component", () => {
  // Sample data for testing
  const universitiesData = [
    {
      id: 1,
      name: "University A",
      stateProvince: "Ontario",
      website: "http://uni-a.com",
    },
  ];

  const favoritesDataEmpty = [];
  const favoritesDataWithEntry = [{ id: 10, universityId: 1 }];

  // Helper function to get a favorite button by its custom name attribute.
  const getFavoriteButtonByName = (expectedName) => {
    const allButtons = screen.getAllByRole("button");
    return allButtons.find((btn) => btn.getAttribute("name") === expectedName);
  };

  beforeEach(() => {
    // Replace global fetch with a jest.fn() before each test.
    global.fetch = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {});
    toastSuccessMock.mockClear();
    toastErrorMock.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test("renders initial data from APIs with pagination controls", async () => {
    // Setup fetch to return universities (with total count) and favorites for GET calls.
    global.fetch.mockImplementation((url, options) => {
      if (url.includes("/api/universities")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              statusCode: 200,
              responseTime: 100,
              data: universitiesData,
              total: universitiesData.length,
              page: 1,
              pageSize: 10,
            }),
        });
      }
      if (url.includes("/api/favorites")) {
        return Promise.resolve({
          json: () => Promise.resolve({ data: favoritesDataEmpty }),
        });
      }
      return Promise.reject(new Error("Unhandled fetch"));
    });

    render(<SearchPage />);

    // Wait until the university name is rendered.
    expect(await screen.findByText("University A")).toBeInTheDocument();
    expect(screen.getByText("Ontario")).toBeInTheDocument();
    expect(screen.getByText("http://uni-a.com")).toBeInTheDocument();

    // Verify that pagination text is rendered (e.g., "Page 1 of 1").
    expect(screen.getByText(/Page 1 of 1/i)).toBeInTheDocument();

    // Instead of using accessible name, filter by the button's name attribute.
    const addButton = getFavoriteButtonByName("Add to Favorites");
    expect(addButton).toBeInTheDocument();

    // Toasts should not be called in the successful initial load.
    expect(toastSuccessMock).not.toHaveBeenCalled();
    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  test("Clear All Filters resets country, name, and pagination", async () => {
    global.fetch.mockImplementation((url, options) => {
      if (url.includes("/api/universities")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              statusCode: 200,
              responseTime: 100,
              data: universitiesData,
              total: universitiesData.length,
              page: 1,
              pageSize: 10,
            }),
        });
      }
      if (url.includes("/api/favorites")) {
        return Promise.resolve({
          json: () => Promise.resolve({ data: favoritesDataEmpty }),
        });
      }
      return Promise.reject(new Error("Unhandled fetch"));
    });

    render(<SearchPage />);
    // Wait for initial data to load.
    await screen.findByText("University A");

    // Change the country and name input values.
    const select = screen.getByTestId("country-select");
    const input = screen.getByPlaceholderText(/Search by name/i);
    fireEvent.change(select, { target: { value: "United States" } });
    fireEvent.change(input, { target: { value: "Test University" } });

    // Verify the values changed.
    expect(select.value).toBe("United States");
    expect(input.value).toBe("Test University");

    // Click the "Clear All Filters" button.
    const clearButton = screen.getByRole("button", {
      name: /Clear All Filters/i,
    });
    fireEvent.click(clearButton);

    // Verify that the filters reset to defaults.
    expect(select.value).toBe("Canada");
    expect(input.value).toBe("");
  });

  test("adds a favorite when clicking Add to Favorites", async () => {
    // Setup: GET endpoints for universities and favorites; POST for adding favorite.
    global.fetch.mockImplementation((url, options) => {
      if (url.includes("/api/universities")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              statusCode: 200,
              responseTime: 100,
              data: universitiesData,
              total: universitiesData.length,
              page: 1,
              pageSize: 10,
            }),
        });
      }
      if (
        url.includes("/api/favorites") &&
        (!options || options.method === "GET")
      ) {
        return Promise.resolve({
          json: () => Promise.resolve({ data: favoritesDataEmpty }),
        });
      }
      if (
        url.includes("/api/favorites") &&
        options &&
        options.method === "POST"
      ) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              statusCode: 201,
              data: { id: 10 },
            }),
        });
      }
      return Promise.reject(new Error("Unhandled fetch in add favorite"));
    });

    render(<SearchPage />);
    // Wait for the university data to be rendered.
    await screen.findByText("University A");

    // Use helper to get the add favorite button.
    const favButton = getFavoriteButtonByName("Add to Favorites");
    expect(favButton).toBeInTheDocument();

    // Click to add favorite.
    fireEvent.click(favButton);

    // Wait for the state update so that the button now reflects removal.
    await waitFor(() => {
      const removeButton = getFavoriteButtonByName("Remove from Favorites");
      expect(removeButton).toBeInTheDocument();
    });

    // Verify that fetch was called with the POST request.
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/favorites",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityId: 1 }),
      })
    );

    // Verify that the success toast was shown.
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Favorite added successfully."
    );
  });

  test("removes a favorite when clicking Remove from Favorites", async () => {
    // Setup: GET returns a favorite for the university; DELETE simulates successful removal.
    global.fetch.mockImplementation((url, options) => {
      if (url.includes("/api/universities")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              statusCode: 200,
              responseTime: 100,
              data: universitiesData,
              total: universitiesData.length,
              page: 1,
              pageSize: 10,
            }),
        });
      }
      if (
        url.includes("/api/favorites") &&
        (!options || options.method === "GET")
      ) {
        return Promise.resolve({
          json: () => Promise.resolve({ data: favoritesDataWithEntry }),
        });
      }
      if (
        url.includes("/api/favorites") &&
        options &&
        options.method === "DELETE"
      ) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              statusCode: 200,
              data: {},
            }),
        });
      }
      return Promise.reject(new Error("Unhandled fetch in remove favorite"));
    });

    render(<SearchPage />);
    await screen.findByText("University A");

    // Use helper to get the remove favorite button.
    const favButton = getFavoriteButtonByName("Remove from Favorites");
    expect(favButton).toBeInTheDocument();

    // Click to remove favorite.
    fireEvent.click(favButton);

    // Wait for state update so that the button reverts to "Add to Favorites".
    await waitFor(() => {
      const addButton = getFavoriteButtonByName("Add to Favorites");
      expect(addButton).toBeInTheDocument();
    });

    // Verify that DELETE was called.
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/favorites?id=10"),
      expect.objectContaining({ method: "DELETE" })
    );

    // Verify that the success toast was shown.
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Favorite removed successfully."
    );
  });

  test("handles error in fetchUniversities gracefully", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    global.fetch.mockImplementation((url) => {
      if (url.includes("/api/universities")) {
        return Promise.reject(new Error("University fetch error"));
      }
      if (url.includes("/api/favorites")) {
        return Promise.resolve({
          json: () => Promise.resolve({ data: favoritesDataEmpty }),
        });
      }
      return Promise.reject(new Error("Unhandled fetch"));
    });

    render(<SearchPage />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching universities:",
        expect.any(Error)
      );
      // Verify that error toast was shown.
      expect(toastErrorMock).toHaveBeenCalledWith(
        "Error fetching universities."
      );
    });

    // Ensure that the loading indicator eventually disappears.
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });

  test("handles error in fetchFavorites gracefully", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    global.fetch.mockImplementation((url) => {
      if (url.includes("/api/universities")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              statusCode: 200,
              responseTime: 100,
              data: universitiesData,
              total: universitiesData.length,
              page: 1,
              pageSize: 10,
            }),
        });
      }
      if (url.includes("/api/favorites")) {
        return Promise.reject(new Error("Favorites fetch error"));
      }
      return Promise.reject(new Error("Unhandled fetch"));
    });

    render(<SearchPage />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching favorites:",
        expect.any(Error)
      );
      // Verify that error toast was shown.
      expect(toastErrorMock).toHaveBeenCalledWith("Error fetching favorites.");
    });
  });

  test("handles error in addFavorite gracefully", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    global.fetch.mockImplementation((url, options) => {
      if (url.includes("/api/universities")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              statusCode: 200,
              responseTime: 100,
              data: universitiesData,
              total: universitiesData.length,
              page: 1,
              pageSize: 10,
            }),
        });
      }
      if (
        url.includes("/api/favorites") &&
        (!options || options.method === "GET")
      ) {
        return Promise.resolve({
          json: () => Promise.resolve({ data: favoritesDataEmpty }),
        });
      }
      if (
        url.includes("/api/favorites") &&
        options &&
        options.method === "POST"
      ) {
        return Promise.reject(new Error("Add favorite error"));
      }
      return Promise.reject(new Error("Unhandled fetch"));
    });

    render(<SearchPage />);
    await screen.findByText("University A");

    // Click the Add to Favorites button.
    const favButton = getFavoriteButtonByName("Add to Favorites");
    fireEvent.click(favButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error adding favorite:",
        expect.any(Error)
      );
      // Verify that error toast was shown.
      expect(toastErrorMock).toHaveBeenCalledWith("Error adding favorite.");
    });
  });

  test("handles error in removeFavorite gracefully", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    // Setup: initial GET returns a favorite and DELETE fails.
    global.fetch.mockImplementation((url, options) => {
      if (url.includes("/api/universities")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              statusCode: 200,
              responseTime: 100,
              data: universitiesData,
              total: universitiesData.length,
              page: 1,
              pageSize: 10,
            }),
        });
      }
      if (
        url.includes("/api/favorites") &&
        (!options || options.method === "GET")
      ) {
        return Promise.resolve({
          json: () => Promise.resolve({ data: favoritesDataWithEntry }),
        });
      }
      if (
        url.includes("/api/favorites") &&
        options &&
        options.method === "DELETE"
      ) {
        return Promise.reject(new Error("Remove favorite error"));
      }
      return Promise.reject(new Error("Unhandled fetch"));
    });

    render(<SearchPage />);
    await screen.findByText("University A");

    // The button should initially have the custom name attribute "Remove from Favorites".
    const favButton = getFavoriteButtonByName("Remove from Favorites");
    fireEvent.click(favButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error removing favorite:",
        expect.any(Error)
      );
      // Verify that error toast was shown.
      expect(toastErrorMock).toHaveBeenCalledWith("Error removing favorite.");
    });
  });
});

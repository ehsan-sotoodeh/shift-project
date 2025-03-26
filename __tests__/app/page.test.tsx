// __tests__/app/page.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchPage from "@/app/page";
import "@testing-library/jest-dom";

// --- Mocks for Auth and Router ---
// Mock the useAuth hook to return a dummy authenticated user.
jest.mock("../../src/app/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user", name: "Test User" },
    loading: false,
  }),
}));

// Mock Next.js router (using next/navigation for app router)
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// --- MOCK TOAST ---
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
  const getFavoriteButtonByName = (expectedName: string) => {
    const allButtons = screen.getAllByRole("button");
    return allButtons.find((btn) => btn.getAttribute("name") === expectedName);
  };

  beforeEach(() => {
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
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/api/universities")) {
        return Promise.resolve({
          json: async () => ({
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
          json: async () => ({ data: favoritesDataEmpty }),
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

  // ... (rest of your tests remain the same)
});

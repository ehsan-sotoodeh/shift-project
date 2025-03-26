// __tests__/components/Header.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Header from "../../src/app/components/Header";
import "@testing-library/jest-dom";

// Create a mutable authState that the mock will return.
const mockLogout = jest.fn();
let authState = {
  user: { id: "1", name: "Test User" },
  logout: mockLogout,
  loading: false,
};

// Mock the AuthContext to return our mutable authState.
jest.mock("../../src/app/context/AuthContext", () => ({
  useAuth: () => authState,
}));

// Mock Next.js router.
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    prefetch: jest.fn(),
  }),
}));

describe("Header Component", () => {
  beforeEach(() => {
    // Reset mocks and authState before each test.
    mockLogout.mockClear();
    mockPush.mockClear();
    authState = {
      user: { id: "1", name: "Test User" },
      logout: mockLogout,
      loading: false,
    };
  });

  test("renders header when authenticated", () => {
    render(<Header />);
    // Check for logo/link to home (MyBrand)
    expect(screen.getByRole("link", { name: /MyBrand/i })).toHaveAttribute(
      "href",
      "/"
    );
    // Check for Favorites link by its aria-label
    expect(screen.getByRole("link", { name: "Favorites" })).toBeInTheDocument();
    // Check for Notifications button (by aria-label)
    expect(
      screen.getByRole("button", { name: "Notifications" })
    ).toBeInTheDocument();
    // Check for user dropdown button (by aria-label)
    expect(
      screen.getByRole("button", { name: "User Profile Dropdown" })
    ).toBeInTheDocument();
  });

  test("returns null when not authenticated", () => {
    // Update authState to simulate unauthenticated state.
    authState = {
      user: null,
      logout: mockLogout,
      loading: false,
    };
    const { container } = render(<Header />);
    expect(container.firstChild).toBeNull();
  });

  test("toggles mobile side menu when hamburger button is clicked", async () => {
    render(<Header />);
    // Initially, mobile side menu (links like "Home") should not be present.
    expect(screen.queryByText("Home")).not.toBeInTheDocument();

    // Click the hamburger button (aria-label "Open menu").
    const hamburgerButton = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(hamburgerButton);
    // Mobile side menu should now be rendered.
    expect(await screen.findByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Favorites")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();

    // Clicking again should close the menu.
    fireEvent.click(hamburgerButton);
    await waitFor(() => {
      expect(screen.queryByText("Home")).not.toBeInTheDocument();
    });
  });

  test("toggles user dropdown and closes when clicking outside", async () => {
    render(<Header />);
    // Initially, the dropdown should not be visible.
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();

    // Click the user dropdown button.
    const userDropdownButton = screen.getByRole("button", {
      name: "User Profile Dropdown",
    });
    fireEvent.click(userDropdownButton);
    // Dropdown should now appear (contains "Logout" and user's name).
    expect(await screen.findByText("Logout")).toBeInTheDocument();
    expect(screen.getByText(/Test User/i)).toBeInTheDocument();

    // Simulate clicking outside the dropdown.
    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(screen.queryByText("Logout")).not.toBeInTheDocument();
    });
  });

  test("calls logout when logout button is clicked in user dropdown", async () => {
    render(<Header />);
    // Open the dropdown.
    const userDropdownButton = screen.getByRole("button", {
      name: "User Profile Dropdown",
    });
    fireEvent.click(userDropdownButton);
    // Wait for the logout button to appear.
    const logoutButton = await screen.findByRole("button", { name: /Logout/i });
    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalled();
  });

  test("renders mobile search bar", () => {
    render(<Header />);
    // Verify mobile search input and button are present.
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });
});

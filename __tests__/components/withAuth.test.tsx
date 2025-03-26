// __tests__/components/withAuth.test.tsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { withAuth } from "../../src/app/components/withAuth";
import "@testing-library/jest-dom";

// Create a dummy component to wrap.
const DummyComponent = () => <div>Protected Content</div>;
const ProtectedComponent = withAuth(DummyComponent);

// We'll override the hooks via jest.mock. Use a factory approach so that you can change return values per test.
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    prefetch: jest.fn(),
  }),
}));

// We’ll also provide a way to override useAuth.
const mockUseAuth = jest.fn();
jest.mock("../../src/app/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("withAuth HOC", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading indicator when loading is true", () => {
    // Simulate loading state.
    mockUseAuth.mockReturnValue({ loading: true, user: undefined });
    render(<ProtectedComponent />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("redirects to login when not loading and no user", async () => {
    // Simulate not loading but unauthenticated.
    mockUseAuth.mockReturnValue({ loading: false, user: null });
    render(<ProtectedComponent />);

    // Wait for useEffect to run.
    await waitFor(() => {
      // Expect that the router.push was called with "/login"
      expect(mockPush).toHaveBeenCalledWith("/login");
    });

    // Since there's no user, the wrapped component should not be rendered.
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  test("renders wrapped component when not loading and user exists", () => {
    // Simulate authenticated state.
    mockUseAuth.mockReturnValue({
      loading: false,
      user: { id: "1", name: "Test User" },
    });
    render(<ProtectedComponent />);

    // The dummy component's text should be displayed.
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});

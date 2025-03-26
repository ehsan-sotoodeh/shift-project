// __tests__/pages/LoginPage.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../../src/app/login/page";
import "@testing-library/jest-dom";

// Mock timers
jest.useFakeTimers();

// Mock console.error to suppress expected error logs
const originalConsoleError = console.error;
const mockConsoleError = jest.fn();

// --- Mocks for Auth, Router, and Toast ---
const mockLogin = jest.fn();
const mockPush = jest.fn();

jest.mock("../../src/app/context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();
jest.mock("react-hot-toast", () => ({
  success: (...args: any[]) => toastSuccessMock(...args),
  error: (...args: any[]) => toastErrorMock(...args),
}));

describe("LoginPage Component", () => {
  beforeAll(() => {
    console.error = mockConsoleError;
  });

  beforeEach(() => {
    global.fetch = jest.fn();
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.getItem = jest.fn();
    jest.clearAllMocks();
  });

  afterAll(() => {
    console.error = originalConsoleError;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("renders the login form and test credentials", () => {
    render(<LoginPage />);

    expect(screen.getByText(/Test Credentials:/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  });

  test("successful login flow", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ statusCode: 200, token: "sometoken" }),
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });
    });

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith("token", "sometoken");
      expect(mockLogin).toHaveBeenCalledWith("sometoken");
      expect(toastSuccessMock).toHaveBeenCalledWith("Login successful!");
    });
  });

  test("failed login shows error toast", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ statusCode: 401, error: "Invalid credentials" }),
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Invalid credentials");
    });
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test("handles fetch error gracefully and logs error", async () => {
    const testError = new Error("Fetch error");
    (global.fetch as jest.Mock).mockRejectedValueOnce(testError);

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error during login:",
        testError
      );
      expect(toastErrorMock).toHaveBeenCalledWith(
        "An unexpected error occurred. Please try again."
      );
    });
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test("form fields are required", () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });
});

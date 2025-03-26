// __tests__/api/login.test.ts

// Declare mock functions with proper types
var mockFindUnique: jest.Mock;
var mockCompare: jest.Mock<Promise<boolean>, [string, string]>;
var mockSign: jest.Mock<string, [object, string, { expiresIn: string }]>;

// Mock next/server
jest.mock("next/server", () => ({
    NextResponse: {
        json: (data: any, options?: { status: number }) => ({
            status: options?.status || 200,
            json: () => Promise.resolve(data),
        }),
    },
}));

// Mock PrismaClient
jest.mock("@prisma/client", () => {
    mockFindUnique = jest.fn();
    return {
        PrismaClient: jest.fn(() => ({
            user: {
                findUnique: mockFindUnique,
            },
        })),
    };
});

// Mock bcrypt
jest.mock("bcrypt", () => {
    mockCompare = jest.fn();
    return {
        compare: mockCompare,
    };
});

// Mock jsonwebtoken
jest.mock("jsonwebtoken", () => {
    mockSign = jest.fn();
    return {
        sign: mockSign,
    };
});

// Import the route handler after all mocks are set up
import { POST } from "../../src/app/api/login/route";

describe("Login API Route", () => {
    const apiUrl = "http://localhost";
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => { });

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = "test-secret";
        process.env.JWT_EXPIRES_IN = "1h";
    });

    afterAll(() => {
        mockConsoleError.mockRestore();
    });

    test("should return 401 status when user is not found", async () => {
        mockFindUnique.mockResolvedValue(null);

        const req = new Request(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: "test@example.com", password: "password123" }),
        });
        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.statusCode).toBe(401);
        expect(data.error).toBe("Invalid credentials");
        expect(mockFindUnique).toHaveBeenCalledWith({
            where: { email: "test@example.com" },
        });
    });

    test("should return 401 status when password is invalid", async () => {
        const fakeUser = { id: "1", email: "test@example.com", password: "hashedpassword" };
        mockFindUnique.mockResolvedValue(fakeUser);
        mockCompare.mockResolvedValue(false);

        const req = new Request(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: "test@example.com", password: "wrongpassword" }),
        });
        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.statusCode).toBe(401);
        expect(data.error).toBe("Invalid credentials");
        expect(mockCompare).toHaveBeenCalledWith("wrongpassword", fakeUser.password);
    });

    test("should return 200 status and token when login is successful", async () => {
        const fakeUser = { id: "1", email: "test@example.com", password: "hashedpassword" };
        mockFindUnique.mockResolvedValue(fakeUser);
        mockCompare.mockResolvedValue(true);
        mockSign.mockReturnValue("sometoken");

        const req = new Request(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: "test@example.com", password: "password123" }),
        });
        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.statusCode).toBe(200);
        expect(data.token).toBe("sometoken");
        expect(mockCompare).toHaveBeenCalledWith("password123", fakeUser.password);
        expect(mockSign).toHaveBeenCalledWith(
            { userId: fakeUser.id, email: fakeUser.email },
            "test-secret",
            { expiresIn: "1h" }
        );
    });

    test("should return 500 status when an unexpected error occurs", async () => {
        mockFindUnique.mockRejectedValue(new Error("Test error"));

        const req = new Request(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: "error@example.com", password: "password123" }),
        });
        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.statusCode).toBe(500);
        expect(data.error).toBe("Internal server error");
    });
});
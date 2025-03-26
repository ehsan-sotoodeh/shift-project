// __tests__/api/universities.test.ts

// --- MOCKS (must be at the very top) ---
var mockFindMany: jest.Mock;

jest.mock('@prisma/client', () => {
  // Initialize the mock function before it is used.
  mockFindMany = jest.fn();
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      university: {
        findMany: mockFindMany,
      },
    })),
  };
});

// Mock next/server to override NextResponse.json so that it returns an object with a status and json() method.
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: (data: any, options?: { status: number }) => {
        return {
          status: options?.status || 200,
          json: () => Promise.resolve(data),
        };
      },
    },
  };
});

// --- END OF MOCKS ---

import { GET } from '../../src/app/api/universities/route'; // Adjust the path as needed

describe('Universities API GET route', () => {
  beforeEach(() => {
    mockFindMany.mockReset();
  });

  test('should return universities when query parameters are provided', async () => {
    const universities = [{ id: 1, name: 'Harvard', country: 'USA' }];
    mockFindMany.mockResolvedValue(universities);

    const request = new Request('http://localhost?country=USA&name=Harv');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.statusCode).toBe(200);
    expect(data.data).toEqual(universities);
    expect(typeof data.responseTime).toBe('number');
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        country: { contains: 'USA' },
        name: { contains: 'Harv' },
      },
    });
  });

  test('should return universities when no query parameters are provided', async () => {
    const universities = [{ id: 2, name: 'MIT', country: 'USA' }];
    mockFindMany.mockResolvedValue(universities);

    const request = new Request('http://localhost');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.statusCode).toBe(200);
    expect(data.data).toEqual(universities);
    expect(mockFindMany).toHaveBeenCalledWith({ where: {} });
  });

  test('should return 500 and error message when an exception is thrown', async () => {
    const errorMessage = 'Test error';
    mockFindMany.mockRejectedValue(new Error(errorMessage));

    const request = new Request('http://localhost');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.statusCode).toBe(500);
    expect(data.message).toBe('Internal Server Error');
    expect(data.error).toBe(errorMessage);
  });
});

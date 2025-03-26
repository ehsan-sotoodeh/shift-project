// __tests__/api/universities.test.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

// --- MOCKS (must be at the very top) ---
var mockFindMany: jest.Mock;
var mockCount: jest.Mock;

// Mock PrismaClient so that we can control the behavior of university.count and university.findMany.
jest.mock('@prisma/client', () => {
  mockFindMany = jest.fn();
  mockCount = jest.fn();
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      university: {
        findMany: mockFindMany,
        count: mockCount,
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

// Mock requireAuth to return null (i.e. no auth error) so the API handler proceeds normally.
jest.mock('../../src/app/utils/authMiddleware', () => ({
  requireAuth: jest.fn(() => null),
}));
// --- END OF MOCKS ---

import { GET } from '../../src/app/api/universities/route'; // Adjust the path as needed

describe('Universities API GET route', () => {
  beforeEach(() => {
    mockFindMany.mockReset();
    mockCount.mockReset();
  });

  test('should return universities when query parameters including pagination are provided', async () => {
    const universities = [{ id: 1, name: 'Harvard', country: 'USA' }];
    // Set the total count to simulate pagination info.
    const totalCount = 100;
    mockCount.mockResolvedValue(totalCount);
    mockFindMany.mockResolvedValue(universities);

    // Provide page and pageSize in the URL.
    const request = new Request('http://localhost?country=USA&name=Harv&page=2&pageSize=5');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.statusCode).toBe(200);
    expect(data.data).toEqual(universities);
    expect(typeof data.responseTime).toBe('number');
    expect(data.total).toBe(totalCount);
    expect(data.page).toBe(2);
    expect(data.pageSize).toBe(5);

    // With page=2 and pageSize=5, skip should be (2-1)*5 = 5.
    expect(mockCount).toHaveBeenCalledWith({
      where: {
        country: { contains: 'USA' },
        name: { contains: 'Harv' },
      },
    });
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        country: { contains: 'USA' },
        name: { contains: 'Harv' },
      },
      skip: 5,
      take: 5,
    });
  });

  test('should return universities with default pagination when no pagination query parameters are provided', async () => {
    const universities = [{ id: 2, name: 'MIT', country: 'USA' }];
    const totalCount = 1;
    mockCount.mockResolvedValue(totalCount);
    mockFindMany.mockResolvedValue(universities);

    // No page or pageSize provided; should default to page=1 and pageSize=10.
    const request = new Request('http://localhost?country=USA');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.statusCode).toBe(200);
    expect(data.data).toEqual(universities);
    expect(data.total).toBe(totalCount);
    expect(data.page).toBe(1);
    expect(data.pageSize).toBe(10);

    // Defaults: page 1 -> skip=0, take=10.
    expect(mockCount).toHaveBeenCalledWith({
      where: {
        country: { contains: 'USA' },
      },
    });
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        country: { contains: 'USA' },
      },
      skip: 0,
      take: 10,
    });
  });

  test('should return 500 and error message when an exception is thrown', async () => {
    const errorMessage = 'Test error';
    // Simulate error for count or findMany.
    mockCount.mockRejectedValue(new Error(errorMessage));

    // Silence the error logging for this test.
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    const request = new Request('http://localhost');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.statusCode).toBe(500);
    expect(data.message).toBe('Internal Server Error');
    expect(data.error).toBe(errorMessage);

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});

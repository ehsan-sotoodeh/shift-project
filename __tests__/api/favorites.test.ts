// __tests__/api/favorites.test.ts

// --- MOCKS (must be at the very top) ---
var mockFavoriteFindMany: jest.Mock;
var mockFavoriteFindUnique: jest.Mock;
var mockFavoriteCreate: jest.Mock;
var mockFavoriteDelete: jest.Mock;
var mockFavoriteCount: jest.Mock;

jest.mock('@prisma/client', () => {
    mockFavoriteFindMany = jest.fn();
    mockFavoriteFindUnique = jest.fn();
    mockFavoriteCreate = jest.fn();
    mockFavoriteDelete = jest.fn();
    mockFavoriteCount = jest.fn();
    return {
        PrismaClient: jest.fn().mockImplementation(() => ({
            favorite: {
                findMany: mockFavoriteFindMany,
                count: mockFavoriteCount,
                create: mockFavoriteCreate,
                findUnique: mockFavoriteFindUnique,
                delete: mockFavoriteDelete,
            },
        })),
    };
});

// Mock next/server for NextResponse.json
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

import {
    GET as GETFavorites,
    POST as POSTFavorite,
    DELETE as DELETEFavorite,
} from '../../src/app/api/favorites/route'; // Adjust the path as needed

describe('Favorites API', () => {
    describe('GET route', () => {
        beforeEach(() => {
            mockFavoriteFindMany.mockReset();
            mockFavoriteCount.mockReset();
        });

        test('should return favorites with pagination when successful and no query parameters provided', async () => {
            const favorites = [{ id: 1, universityId: 100 }];
            // For defaults: page=1, pageSize=10 so skip=0.
            mockFavoriteCount.mockResolvedValue(1);
            mockFavoriteFindMany.mockResolvedValue(favorites);

            // Request with no pagination query parameters.
            const request = new Request('http://localhost');
            const response = await GETFavorites(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.statusCode).toBe(200);
            expect(data.data).toEqual(favorites);
            expect(data.total).toBe(1);
            expect(data.page).toBe(1);
            expect(data.pageSize).toBe(10);

            expect(mockFavoriteCount).toHaveBeenCalled();
            expect(mockFavoriteFindMany).toHaveBeenCalledWith({
                include: { university: true },
                skip: 0,
                take: 10,
            });
        });

        test('should return favorites with correct pagination when query parameters are provided', async () => {
            const favorites = [{ id: 2, universityId: 200 }];
            // For example: page=2, pageSize=5, skip = (2-1)*5 = 5.
            mockFavoriteCount.mockResolvedValue(6);
            mockFavoriteFindMany.mockResolvedValue(favorites);

            const request = new Request('http://localhost?page=2&pageSize=5');
            const response = await GETFavorites(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.statusCode).toBe(200);
            expect(data.data).toEqual(favorites);
            expect(data.total).toBe(6);
            expect(data.page).toBe(2);
            expect(data.pageSize).toBe(5);

            expect(mockFavoriteFindMany).toHaveBeenCalledWith({
                include: { university: true },
                skip: 5,
                take: 5,
            });
        });

        test('should return 500 when an error is thrown in GET', async () => {
            const errorMessage = 'Test error';
            mockFavoriteCount.mockRejectedValue(new Error(errorMessage));

            const request = new Request('http://localhost');
            const response = await GETFavorites(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.statusCode).toBe(500);
            expect(data.error).toBe(errorMessage);
        });
    });

    describe('POST route', () => {
        beforeEach(() => {
            mockFavoriteCreate.mockReset();
        });

        test('should return 400 when universityId is not provided', async () => {
            const request = new Request('http://localhost', {
                method: 'POST',
                body: JSON.stringify({}),
            });
            const response = await POSTFavorite(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.statusCode).toBe(400);
            expect(data.error).toBe('universityId is required');
        });

        test('should create a favorite and return 201 when valid universityId is provided', async () => {
            const favorite = { id: 1, universityId: 123 };
            mockFavoriteCreate.mockResolvedValue(favorite);

            const request = new Request('http://localhost', {
                method: 'POST',
                body: JSON.stringify({ universityId: 123 }),
            });
            const response = await POSTFavorite(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.statusCode).toBe(201);
            expect(data.data).toEqual(favorite);
            expect(mockFavoriteCreate).toHaveBeenCalledWith({
                data: { universityId: 123 },
            });
        });

        test('should return 500 when an error is thrown in POST', async () => {
            const errorMessage = 'Create error';
            mockFavoriteCreate.mockRejectedValue(new Error(errorMessage));

            const request = new Request('http://localhost', {
                method: 'POST',
                body: JSON.stringify({ universityId: 123 }),
            });
            const response = await POSTFavorite(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.statusCode).toBe(500);
            expect(data.error).toBe(errorMessage);
        });
    });

    describe('DELETE route', () => {
        beforeEach(() => {
            mockFavoriteFindUnique.mockReset();
            mockFavoriteDelete.mockReset();
        });

        test('should return 400 when id parameter is not provided', async () => {
            const request = new Request('http://localhost');
            const response = await DELETEFavorite(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.statusCode).toBe(400);
            expect(data.error).toBe('id parameter is required');
        });

        test('should return 404 when favorite is not found', async () => {
            const request = new Request('http://localhost?id=5');
            mockFavoriteFindUnique.mockResolvedValue(null);

            const response = await DELETEFavorite(request);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.statusCode).toBe(404);
            expect(data.error).toBe('Favorite not found');
        });

        test('should delete the favorite and return 200 when found', async () => {
            const request = new Request('http://localhost?id=5');
            const existingFavorite = { id: 5, universityId: 123 };
            const deletedFavorite = { id: 5, universityId: 123 };

            mockFavoriteFindUnique.mockResolvedValue(existingFavorite);
            mockFavoriteDelete.mockResolvedValue(deletedFavorite);

            const response = await DELETEFavorite(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.statusCode).toBe(200);
            expect(data.data).toEqual(deletedFavorite);
            expect(mockFavoriteFindUnique).toHaveBeenCalledWith({
                where: { id: 5 },
            });
            expect(mockFavoriteDelete).toHaveBeenCalledWith({
                where: { id: 5 },
            });
        });

        test('should return 500 when an error is thrown in DELETE', async () => {
            const errorMessage = 'Delete error';
            const existingFavorite = { id: 5, universityId: 123 };

            mockFavoriteFindUnique.mockResolvedValue(existingFavorite);
            mockFavoriteDelete.mockRejectedValue(new Error(errorMessage));

            const request = new Request('http://localhost?id=5');
            const response = await DELETEFavorite(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.statusCode).toBe(500);
            expect(data.error).toBe(errorMessage);
        });
    });
});

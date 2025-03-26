/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');

    // Set defaults: page 1 and 10 items per page.
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;
    const skip = (page - 1) * pageSize;

    try {
        // Count total favorites.
        const total = await prisma.favorite.count();

        // Fetch paginated favorites including related university data.
        const favorites = await prisma.favorite.findMany({
            include: { university: true },
            skip,
            take: pageSize,
        });

        return NextResponse.json({
            statusCode: 200,
            data: favorites,
            total,
            page,
            pageSize,
        });
    } catch (error) {
        return NextResponse.json(
            {
                statusCode: 500,
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { universityId } = body;
        if (!universityId) {
            return NextResponse.json(
                { statusCode: 400, error: 'universityId is required' },
                { status: 400 }
            );
        }
        const favorite = await prisma.favorite.create({
            data: { universityId },
        });
        return NextResponse.json({ statusCode: 201, data: favorite }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { statusCode: 500, error: (error as Error).message },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const favoriteId = searchParams.get('id');
        if (!favoriteId) {
            return NextResponse.json(
                { statusCode: 400, error: 'id parameter is required' },
                { status: 400 }
            );
        }

        // Check if the favorite record exists.
        const existingFavorite = await prisma.favorite.findUnique({
            where: { id: parseInt(favoriteId) },
        });

        if (!existingFavorite) {
            return NextResponse.json(
                { statusCode: 404, error: 'Favorite not found' },
                { status: 404 }
            );
        }

        const deleted = await prisma.favorite.delete({
            where: { id: parseInt(favoriteId) },
        });
        return NextResponse.json({ statusCode: 200, data: deleted });
    } catch (error: any) {
        return NextResponse.json(
            { statusCode: 500, error: error.message },
            { status: 500 }
        );
    }
}

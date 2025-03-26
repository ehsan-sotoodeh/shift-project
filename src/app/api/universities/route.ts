/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/app/utils/authMiddleware';


const prisma = new PrismaClient();

export async function GET(request: Request) {
    const authResult = requireAuth(request);
    if (typeof authResult !== 'string' && authResult && typeof authResult.json === 'function') {
        return authResult;
    }

    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const name = searchParams.get('name');
    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');

    // Set defaults: page 1 and 10 items per page
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;
    const skip = (page - 1) * pageSize;

    const whereClause: any = {};
    if (country) {
        whereClause.country = { contains: country };
    }
    if (name) {
        whereClause.name = { contains: name };
    }

    try {
        // Get the total count for pagination info
        const total = await prisma.university.count({ where: whereClause });

        // Fetch the universities with pagination
        const universities = await prisma.university.findMany({
            where: whereClause,
            skip,
            take: pageSize,
        });
        const responseTime = Date.now() - startTime;
        return NextResponse.json({
            statusCode: 200,
            responseTime,
            data: universities,
            total,
            page,
            pageSize
        });
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            statusCode: 500,
            message: 'Internal Server Error',
            error: errorMessage,
        }, { status: 500 });
    }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const name = searchParams.get('name');
    const whereClause: any = {};
    if (country) {
        whereClause.country = { contains: country };
    }
    if (name) {
        whereClause.name = { contains: name };
    }
    try {
        const universities = await prisma.university.findMany({ where: whereClause });
        const responseTime = Date.now() - startTime;
        return NextResponse.json({
            statusCode: 200,
            responseTime,
            data: universities,
        });
    } catch (error) {
        console.log(error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            statusCode: 500,
            message: 'Internal Server Error',
            error: errorMessage,
        }, { status: 500 });
    }
}

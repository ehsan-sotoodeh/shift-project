// app/api/login/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {

    try {
        const { email, password } = await request.json();

        // Lookup the user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { statusCode: 401, error: 'Invalid credentials' },
                { status: 401 }
            );
        }
        // Compare submitted password with stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { statusCode: 401, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Generate JWT using environment variables for secret and expiration
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: process.env.JWT_EXPIRES_IN || '86400s' }
        );

        // Return the token in the response
        return NextResponse.json({ statusCode: 200, token });
    } catch (error: any) {
        console.error("Error in login API:", error);
        return NextResponse.json(
            { statusCode: 500, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

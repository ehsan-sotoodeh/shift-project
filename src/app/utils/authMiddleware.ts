import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
}

export function requireAuth(request: Request): string | NextResponse {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token || !verifyToken(token)) {
        return NextResponse.json(
            { statusCode: 401, error: "Unauthorized" },
            { status: 401 }
        );
    }
    return token;
}
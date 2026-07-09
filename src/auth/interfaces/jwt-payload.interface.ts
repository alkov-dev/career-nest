import { User } from "@prisma/client";

export interface JwtPayload {
    sub: number;
    email: string;
    role: string;
}

export interface Tokens {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface JwtRefreshPayload {
    sub: number;
    iat?: number;
    exp?: number;
}
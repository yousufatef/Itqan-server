import { UserRole } from "./enums";

export type User = {
    id: number;
    email: string;
    username: string | null;
    userType: UserRole;
    isActive: boolean;
    tokenVersion: number;
    profileImage: string | null;
    created_at: Date;
    updated_at: Date;
};

export type authTokensType = {
    accessToken: string;
    refreshToken: string;
    user: Omit<User, 'password'>;
};

export type JwtPayloadType = {
    id: number;
    userType: string;
    tokenVersion: number;
};

export type accessTokenType = {
    accessToken: string;
};

export interface UserProfile {
    email: string;
    username: string | null;
    userType: UserRole;
    id: number;
    created_at: Date;
    updated_at: Date;
    isActive: boolean;
    tokenVersion: number;
    profileImage: string | null;
}

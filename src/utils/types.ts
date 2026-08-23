import { UserType } from "./enums";


export type User = {
    id: number;
    email: string;
    username: string | null;
    userType: UserType;
    isActive: boolean;
    profileImage: string | null;
    created_at: Date;
    updated_at: Date;
};

export type authTokensType = {
    accessToken: string;
    refreshToken: string;
    user: User
};

export type JwtPayloadType = {
    id: number;
    userType: string;
};
export type accessTokenType = {
    accessToken: string;
}
export interface UserProfile {
    email: string;
    username: string | null;
    userType: UserType;
    id: number;
    created_at: Date;
    updated_at: Date;
    isActive: boolean;
    profileImage: string | null;
}

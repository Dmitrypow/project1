export interface ApiError {
    status: number;
    message: string;
    details?: string;
}

export interface UserDto {
    id: number;
    fullName: string;
    email: string;
    role: string;
}

export interface ZoneDto {
    id: number;
    name: string;
}

export interface PassResponseDto {
    id: number;
    userId: number;
    zoneId: number;
    studentName?: string;
    zoneName?: string;
    reason: string;
    validUntil: string;
    issuerName: string;
    comment: string | null;
    createdAt: string;
}

export interface CreatePassDto {
    userId: number;
    zoneId: number;
    reason: string;
    validUntil: string;
    issuerName: string;
    comment?: string;
}

export interface UpdatePassDto {
    userId?: number;
    zoneId?: number;
    reason?: string;
    validUntil?: string;
    issuerName?: string;
    comment?: string;
}

export interface CreateUserDto {
    fullName: string;
    email: string;
    role: string;
}

export interface UpdateUserDto {
    fullName?: string;
    email?: string;
    role?: string;
}

export interface UserResponseDto {
    id: number;
    fullName: string;
    email: string;
    role: string;
    createdAt: string;
}

export interface PassStatsDto {
    [key: string]: unknown;
}

export interface TopStudentsDto {
    [reason: string]: {
        rank: number;
        userId: number;
        studentName: string;
        passCount: number;
    }[];
}
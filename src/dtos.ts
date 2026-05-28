export interface ApiError {
    status: number;
    message: string;
    details?: string;
}

export interface UserDto {
    id: number;
    fullName: string;
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
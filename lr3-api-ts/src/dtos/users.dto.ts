// ─── Domain types ────────────────────────────────────────────────────────────

export type UserRole = "Студент" | "Викладач" | "Адмін";

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// ─── Create DTO ──────────────────────────────────────────────────────────────

export interface CreateUserDto {
  fullName: string;
  email: string;
  role: UserRole;
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  role?: UserRole;
}

export interface UserResponseDto {
  id: number;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function requireString(value: unknown, field: string, minLen = 1): ValidationError | null {
  if (typeof value !== "string" || value.trim().length < minLen) {
    return { field, message: `${field} must be a non-empty string (min ${minLen} chars)` };
  }
  return null;
}

function requireEmail(value: unknown, field: string): ValidationError | null {
  if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return { field, message: `${field} must be a valid email address` };
  }
  return null;
}

// ─── Validators ──────────────────────────────────────────────────────────────

export function validateCreateUserDto(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];
  const e1 = requireString(body.fullName, "fullName", 2);
  if (e1) errors.push(e1);
  const e2 = requireEmail(body.email, "email");
  if (e2) errors.push(e2);
  const e3 = requireString(body.role, "role", 2);
  if (e3) errors.push(e3);
  return errors;
}

export function parseCreateUserDto(body: Record<string, unknown>): CreateUserDto {
  return {
    fullName: (body.fullName as string).trim(),
    email: (body.email as string).trim().toLowerCase(),
    role: (body.role as string).trim() as UserRole,
  };
}

export function validateUpdateUserDto(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];
  if (body.fullName !== undefined) {
    const e = requireString(body.fullName, "fullName", 2);
    if (e) errors.push(e);
  }
  if (body.email !== undefined) {
    const e = requireEmail(body.email, "email");
    if (e) errors.push(e);
  }
  if (body.role !== undefined) {
    const e = requireString(body.role, "role", 2);
    if (e) errors.push(e);
  }
  if (Object.keys(body).length === 0) {
    errors.push({ field: "body", message: "At least one field must be provided for update" });
  }
  return errors;
}

export function parseUpdateUserDto(body: Record<string, unknown>): UpdateUserDto {
  const dto: UpdateUserDto = {};
  if (body.fullName !== undefined) dto.fullName = (body.fullName as string).trim();
  if (body.email !== undefined) dto.email = (body.email as string).trim().toLowerCase();
  if (body.role !== undefined) dto.role = (body.role as string).trim() as UserRole;
  return dto;
}

export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

// ─── Domain types ────────────────────────────────────────────────────────────

export const ALLOWED_REASONS = [
  "Навчання",
  "Лабораторна робота",
  "Робота над проектом",
  "Технічне обслуговування",
] as const;

export type PassReason = (typeof ALLOWED_REASONS)[number];

export interface Pass {
  id: number;
  userId: number;
  roomId: number;
  studentName?: string;
  roomNumber?: string;
  reason: PassReason;
  validUntil: string;
  issuerName: string;
  comment: string | null;
  createdAt: string;
}

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface CreatePassDto {
  userId: number;
  roomId: number;
  reason: PassReason;
  validUntil: string;
  issuerName: string;
  comment: string;
}

export interface UpdatePassDto {
  userId?: number;
  roomId?: number;
  reason?: PassReason;
  validUntil?: string;
  issuerName?: string;
  comment?: string;
}

export interface PassResponseDto {
  id: number;
  userId: number;
  roomId: number;
  studentName: string | undefined;
  roomNumber: string | undefined;
  reason: string;
  validUntil: string;
  issuerName: string;
  comment: string | null;
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

function requireNumber(value: unknown, field: string): ValidationError | null {
  if (typeof value !== "number" || isNaN(value)) {
    return { field, message: `${field} must be a valid number` };
  }
  return null;
}

function requireIsoDate(value: unknown, field: string): ValidationError | null {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    isNaN(Date.parse(value))
  ) {
    return { field, message: `${field} must be a valid date in ISO format YYYY-MM-DD` };
  }
  return null;
}

function requireEnum(value: unknown, field: string, allowed: readonly string[]): ValidationError | null {
  if (!allowed.includes(value as string)) {
    return { field, message: `${field} must be one of: ${allowed.join(", ")}` };
  }
  return null;
}

// ─── Validators ──────────────────────────────────────────────────────────────

export function validateCreatePassDto(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];
  const e1 = requireNumber(body.userId, "userId");
  if (e1) errors.push(e1);
  const e1room = requireNumber(body.roomId, "roomId");
  if (e1room) errors.push(e1room);
  const e2 = requireEnum(body.reason, "reason", ALLOWED_REASONS);
  if (e2) errors.push(e2);
  const e3 = requireIsoDate(body.validUntil, "validUntil");
  if (e3) errors.push(e3);
  const e4 = requireString(body.issuerName, "issuerName", 2);
  if (e4) errors.push(e4);
  return errors;
}

export function parseCreatePassDto(body: Record<string, unknown>): CreatePassDto {
  return {
    userId: body.userId as number,
    roomId: body.roomId as number,
    reason: body.reason as PassReason,
    validUntil: body.validUntil as string,
    issuerName: (body.issuerName as string).trim(),
    comment: body.comment ? (body.comment as string).trim() : "",
  };
}

export function validateUpdatePassDto(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];
  if (body.reason !== undefined) {
    const e = requireEnum(body.reason, "reason", ALLOWED_REASONS);
    if (e) errors.push(e);
  }
  return errors;
}

export function parseUpdatePassDto(body: Record<string, unknown>): UpdatePassDto {
  const dto: UpdatePassDto = {};
  if (body.reason !== undefined) dto.reason = body.reason as PassReason;
  return dto;
}

export function toPassResponseDto(pass: Pass): PassResponseDto {
  return {
    id: pass.id,
    userId: pass.userId,
    roomId: pass.roomId,
    studentName: pass.studentName,
    roomNumber: pass.roomNumber,
    reason: pass.reason,
    validUntil: pass.validUntil,
    issuerName: pass.issuerName,
    comment: pass.comment,
    createdAt: pass.createdAt,
  };
}

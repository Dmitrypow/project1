// ─── Domain types ────────────────────────────────────────────────────────────

export interface Room {
  id: number;
  number: string;
  capacity: number;
}

export interface CreateRoomDto {
  number: string;
  capacity: number;
}

export interface UpdateRoomDto {
  number?: string;
  capacity?: number;
}

export interface RoomResponseDto {
  id: number;
  number: string;
  capacity: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ─── Validators ──────────────────────────────────────────────────────────────

export function validateCreateRoomDto(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof body.number !== "string" || body.number.trim().length === 0) {
    errors.push({ field: "number", message: "number must be a non-empty string" });
  }
  if (typeof body.capacity !== "number" || isNaN(body.capacity) || body.capacity <= 0) {
    errors.push({ field: "capacity", message: "capacity must be a positive number" });
  }
  return errors;
}

export function parseCreateRoomDto(body: Record<string, unknown>): CreateRoomDto {
  return {
    number: (body.number as string).trim(),
    capacity: body.capacity as number,
  };
}

export function validateUpdateRoomDto(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];
  if (body.number !== undefined) {
    if (typeof body.number !== "string" || body.number.trim().length === 0) {
      errors.push({ field: "number", message: "number must be a non-empty string" });
    }
  }
  if (body.capacity !== undefined) {
    if (typeof body.capacity !== "number" || isNaN(body.capacity) || (body.capacity as number) <= 0) {
      errors.push({ field: "capacity", message: "capacity must be a positive number" });
    }
  }
  if (Object.keys(body).length === 0) {
    errors.push({ field: "body", message: "At least one field must be provided for update" });
  }
  return errors;
}

export function parseUpdateRoomDto(body: Record<string, unknown>): UpdateRoomDto {
  const dto: UpdateRoomDto = {};
  if (body.number !== undefined) dto.number = (body.number as string).trim();
  if (body.capacity !== undefined) dto.capacity = body.capacity as number;
  return dto;
}

export function toRoomResponseDto(room: Room): RoomResponseDto {
  return { id: room.id, number: room.number, capacity: room.capacity };
}

import * as passesRepo from "../repositories/passes.repository";
import { ApiError } from "../middleware/error-handler.middleware";
import { CreatePassDto, UpdatePassDto, PassEntity } from "../dtos/passes.dto";
import { PassFilters } from "../repositories/passes.repository";

export function getAll(filters: PassFilters): PassEntity[] {
  return passesRepo.getAll(filters);
}

export function getById(id: number): PassEntity {
  const pass = passesRepo.getById(id);
  if (!pass) throw new ApiError(404, "NOT_FOUND", `Pass with id "${id}" not found`);
  return pass;
}

export function getByIdWithUser(id: number): Record<string, unknown> {
  const pass = passesRepo.getByIdWithUser(id);
  if (!pass) throw new ApiError(404, "NOT_FOUND", `Pass with id "${id}" not found`);
  return pass;
}

export function getStatsByReason(): Record<string, unknown>[] {
  return passesRepo.getStatsByReason();
}

export function create(dto: CreatePassDto): PassEntity {
  const today = new Date().toISOString().slice(0, 10);
  if (dto.validUntil < today) {
    throw new ApiError(400, "VALIDATION_ERROR", "validUntil must not be in the past", [
      { field: "validUntil", message: "Date must be today or in the future" },
    ]);
  }
  return passesRepo.add(dto);
}

export function update(id: number, dto: UpdatePassDto): PassEntity {
  const existing = passesRepo.getById(id);
  if (!existing) throw new ApiError(404, "NOT_FOUND", `Pass with id "${id}" not found`);

  if (dto.validUntil) {
    const today = new Date().toISOString().slice(0, 10);
    if (dto.validUntil < today) {
      throw new ApiError(400, "VALIDATION_ERROR", "validUntil must not be in the past", [
        { field: "validUntil", message: "Date must be today or in the future" },
      ]);
    }
  }

  const updated = passesRepo.update(id, dto);
  if (!updated) throw new ApiError(404, "NOT_FOUND", `Pass with id "${id}" not found`);
  return updated;
}

export function remove(id: number): void {
  const deleted = passesRepo.remove(id);
  if (!deleted) throw new ApiError(404, "NOT_FOUND", `Pass with id "${id}" not found`);
}

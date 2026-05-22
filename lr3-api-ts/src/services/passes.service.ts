import * as passesRepo from "../repositories/passes.repository";
import { ApiError } from "../middleware/error-handler.middleware";
import { Pass, CreatePassDto, UpdatePassDto } from "../dtos/passes.dto";
import { PassFilters, PassStats, TopStudentByReason } from "../repositories/passes.repository";

export async function getAll(filters: PassFilters): Promise<Pass[]> {
  return await passesRepo.getAll(filters);
}

export async function getById(id: string): Promise<Pass> {
  const pass = await passesRepo.getById(id);
  if (!pass) throw new ApiError(404, "NOT_FOUND", `Pass with id "${id}" not found`);
  return pass;
}

export async function create(dto: CreatePassDto): Promise<Pass> {
  const today = new Date().toISOString().slice(0, 10);
  if (dto.validUntil < today) {
    throw new ApiError(400, "VALIDATION_ERROR", "validUntil must not be in the past", [
      { field: "validUntil", message: "Date must be today or in the future" },
    ]);
  }
  const pass = await passesRepo.add(dto);
  if (!pass) throw new ApiError(500, "INTERNAL_ERROR", "Failed to create pass");
  return pass;
}

export async function update(id: string, dto: UpdatePassDto): Promise<Pass> {
  const existing = await passesRepo.getById(id);
  if (!existing) throw new ApiError(404, "NOT_FOUND", `Pass with id "${id}" not found`);

  if (dto.validUntil) {
    const today = new Date().toISOString().slice(0, 10);
    if (dto.validUntil < today) {
      throw new ApiError(400, "VALIDATION_ERROR", "validUntil must not be in the past", [
        { field: "validUntil", message: "Date must be today or in the future" },
      ]);
    }
  }

  const updated = await passesRepo.update(id, dto);
  if (!updated) throw new ApiError(500, "INTERNAL_ERROR", "Failed to update pass");
  return updated;
}

export async function remove(id: string): Promise<void> {
  const deleted = await passesRepo.remove(id);
  if (!deleted) throw new ApiError(404, "NOT_FOUND", `Pass with id "${id}" not found`);
}

export async function getStats(): Promise<PassStats> {
  return await passesRepo.getStats();
}

export async function getTopStudents(): Promise<TopStudentByReason[]> {
  return await passesRepo.getTopStudentsByReason();
}

export async function search(q: string): Promise<Pass[]> {
  return await passesRepo.searchByIssuer(q);
}

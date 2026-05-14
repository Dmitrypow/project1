import * as usersRepo from "../repositories/users.repository";
import { ApiError } from "../middleware/error-handler.middleware";
import { CreateUserDto, UpdateUserDto, UserEntity } from "../dtos/users.dto";

export function getAll(): UserEntity[] {
  return usersRepo.getAll();
}

export function getById(id: number): UserEntity {
  const user = usersRepo.getById(id);
  if (!user) throw new ApiError(404, "NOT_FOUND", `User with id "${id}" not found`);
  return user;
}

export function create(dto: CreateUserDto): UserEntity {
  const existing = usersRepo.getByEmail(dto.email);
  if (existing) {
    throw new ApiError(409, "CONFLICT", `User with email "${dto.email}" already exists`);
  }
  return usersRepo.add(dto);
}

export function update(id: number, dto: UpdateUserDto): UserEntity {
  const existing = usersRepo.getById(id);
  if (!existing) throw new ApiError(404, "NOT_FOUND", `User with id "${id}" not found`);

  if (dto.email && dto.email !== existing.email) {
    const emailTaken = usersRepo.getByEmail(dto.email);
    if (emailTaken) {
      throw new ApiError(409, "CONFLICT", `User with email "${dto.email}" already exists`);
    }
  }

  const updated = usersRepo.update(id, dto);
  if (!updated) throw new ApiError(404, "NOT_FOUND", `User with id "${id}" not found`);
  return updated;
}

export function remove(id: number): void {
  const deleted = usersRepo.remove(id);
  if (!deleted) throw new ApiError(404, "NOT_FOUND", `User with id "${id}" not found`);
}

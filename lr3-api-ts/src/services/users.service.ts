import * as usersRepo from "../repositories/users.repository";
import { ApiError } from "../middleware/error-handler.middleware";
import { User, CreateUserDto, UpdateUserDto } from "../dtos/users.dto";

export async function getAll(): Promise<User[]> {
  return await usersRepo.getAll();
}

export async function getById(id: string): Promise<User> {
  const user = await usersRepo.getById(id);
  if (!user) throw new ApiError(404, "NOT_FOUND", `User with id "${id}" not found`);
  return user;
}

export async function create(dto: CreateUserDto): Promise<User> {
  const existing = await usersRepo.getByEmail(dto.email);
  if (existing) {
    throw new ApiError(409, "CONFLICT", `User with email "${dto.email}" already exists`);
  }
  const user = await usersRepo.add(dto);
  if (!user) throw new ApiError(500, "INTERNAL_ERROR", "Failed to create user");
  return user;
}

export async function update(id: string, dto: UpdateUserDto): Promise<User> {
  const existing = await usersRepo.getById(id);
  if (!existing) throw new ApiError(404, "NOT_FOUND", `User with id "${id}" not found`);

  if (dto.email && dto.email !== existing.email) {
    const emailTaken = await usersRepo.getByEmail(dto.email);
    if (emailTaken) {
      throw new ApiError(409, "CONFLICT", `User with email "${dto.email}" already exists`);
    }
  }

  const updated = await usersRepo.update(id, dto);
  if (!updated) throw new ApiError(500, "INTERNAL_ERROR", "Failed to update user");
  return updated;
}

export async function remove(id: string): Promise<void> {
  const deleted = await usersRepo.remove(id);
  if (!deleted) throw new ApiError(404, "NOT_FOUND", `User with id "${id}" not found`);
}

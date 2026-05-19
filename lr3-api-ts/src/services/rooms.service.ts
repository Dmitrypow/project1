import * as roomsRepo from "../repositories/rooms.repository";
import { ApiError } from "../middleware/error-handler.middleware";
import { Room, CreateRoomDto, UpdateRoomDto } from "../dtos/rooms.dto";

export async function getAll(): Promise<Room[]> {
  return await roomsRepo.getAll();
}

export async function getById(id: string): Promise<Room> {
  const room = await roomsRepo.getById(id);
  if (!room) throw new ApiError(404, "NOT_FOUND", `Room with id "${id}" not found`);
  return room;
}

export async function create(dto: CreateRoomDto): Promise<Room> {
  const existing = await roomsRepo.getByNumber(dto.number);
  if (existing) {
    throw new ApiError(409, "CONFLICT", `Room with number "${dto.number}" already exists`);
  }
  const room = await roomsRepo.add(dto);
  if (!room) throw new ApiError(500, "INTERNAL_ERROR", "Failed to create room");
  return room;
}

export async function update(id: string, dto: UpdateRoomDto): Promise<Room> {
  const existing = await roomsRepo.getById(id);
  if (!existing) throw new ApiError(404, "NOT_FOUND", `Room with id "${id}" not found`);

  if (dto.number && dto.number !== existing.number) {
    const taken = await roomsRepo.getByNumber(dto.number);
    if (taken) throw new ApiError(409, "CONFLICT", `Room with number "${dto.number}" already exists`);
  }

  const updated = await roomsRepo.update(id, dto);
  if (!updated) throw new ApiError(500, "INTERNAL_ERROR", "Failed to update room");
  return updated;
}

export async function remove(id: string): Promise<void> {
  const deleted = await roomsRepo.remove(id);
  if (!deleted) throw new ApiError(404, "NOT_FOUND", `Room with id "${id}" not found`);
}

import { Request, Response, NextFunction } from "express";
import * as roomsService from "../services/rooms.service";
import { ApiError } from "../middleware/error-handler.middleware";
import {
  validateCreateRoomDto,
  parseCreateRoomDto,
  validateUpdateRoomDto,
  parseUpdateRoomDto,
  toRoomResponseDto,
} from "../dtos/rooms.dto";

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rooms = await roomsService.getAll();
    res.status(200).json({ items: rooms.map(toRoomResponseDto) });
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const room = await roomsService.getById(req.params.id);
    res.status(200).json(toRoomResponseDto(room));
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validateCreateRoomDto(req.body as Record<string, unknown>);
    if (errors.length > 0) throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", errors);
    const dto = parseCreateRoomDto(req.body as Record<string, unknown>);
    const room = await roomsService.create(dto);
    res.status(201).json(toRoomResponseDto(room));
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validateUpdateRoomDto(req.body as Record<string, unknown>);
    if (errors.length > 0) throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", errors);
    const dto = parseUpdateRoomDto(req.body as Record<string, unknown>);
    const room = await roomsService.update(req.params.id, dto);
    res.status(200).json(toRoomResponseDto(room));
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await roomsService.remove(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

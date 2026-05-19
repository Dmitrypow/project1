import { Request, Response, NextFunction } from "express";
import * as usersService from "../services/users.service";
import { ApiError } from "../middleware/error-handler.middleware";
import {
  validateCreateUserDto,
  parseCreateUserDto,
  validateUpdateUserDto,
  parseUpdateUserDto,
  toUserResponseDto,
} from "../dtos/users.dto";

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await usersService.getAll();
    res.status(200).json({ items: users.map(toUserResponseDto) });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await usersService.getById(req.params.id);
    res.status(200).json(toUserResponseDto(user));
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validateCreateUserDto(req.body as Record<string, unknown>);
    if (errors.length > 0) throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", errors);
    const dto = parseCreateUserDto(req.body as Record<string, unknown>);
    const user = await usersService.create(dto);
    res.status(201).json(toUserResponseDto(user));
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validateUpdateUserDto(req.body as Record<string, unknown>);
    if (errors.length > 0) throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", errors);
    const dto = parseUpdateUserDto(req.body as Record<string, unknown>);
    const user = await usersService.update(req.params.id, dto);
    res.status(200).json(toUserResponseDto(user));
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await usersService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

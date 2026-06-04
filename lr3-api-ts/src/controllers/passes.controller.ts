import { Request, Response, NextFunction } from "express";
import * as passesService from "../services/passes.service";
import { ApiError } from "../middleware/error-handler.middleware";
import {
  validateCreatePassDto,
  parseCreatePassDto,
  validateUpdatePassDto,
  parseUpdatePassDto,
  toPassResponseDto,
} from "../dtos/passes.dto";

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const passes = await passesService.getAll(req.query as Record<string, string>);
    res.status(200).json({ items: passes.map(toPassResponseDto) });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pass = await passesService.getById(req.params.id);
    res.status(200).json(toPassResponseDto(pass));
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validateCreatePassDto(req.body as Record<string, unknown>);
    if (errors.length > 0) throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", errors);
    const dto = parseCreatePassDto(req.body as Record<string, unknown>);
    const pass = await passesService.create(dto);
    res.status(201).json(toPassResponseDto(pass));
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validateUpdatePassDto(req.body as Record<string, unknown>);
    if (errors.length > 0) throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body", errors);
    const dto = parseUpdatePassDto(req.body as Record<string, unknown>);
    const ownerUserId = req.currentUser?.id;
    const pass = await passesService.update(req.params.id, dto, ownerUserId);
    res.status(200).json(toPassResponseDto(pass));
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ownerUserId = req.currentUser?.id;
    await passesService.remove(req.params.id, ownerUserId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getTopStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await passesService.getTopStudents();
    const grouped: Record<string, { rank: number; userId: number; studentName: string; passCount: number }[]> = {};
    for (const row of data) {
      if (!grouped[row.reason]) grouped[row.reason] = [];
      grouped[row.reason].push({
        rank: row.rank,
        userId: row.userId,
        studentName: row.studentName,
        passCount: row.passCount,
      });
    }
    res.status(200).json({ data: grouped });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await passesService.getStats();
    res.status(200).json({ data: stats });
  } catch (err) {
    next(err);
  }
}

export async function search(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = String(req.query.q ?? "");
    const passes = await passesService.search(q);
    res.status(200).json({ items: passes });
  } catch (err) {
    next(err);
  }
}

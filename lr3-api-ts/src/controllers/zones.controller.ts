import { Request, Response, NextFunction } from "express";
import * as zonesRepo from "../repositories/zones.repository";
import { toZoneDto } from "../dtos/zones.dto";

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const zones = await zonesRepo.getAll();
    res.status(200).json({ items: zones.map(toZoneDto) });
  } catch (err) { 
    next(err); 
  }
}
import { Request, Response, NextFunction } from "express";
import * as usersRepo from "../repositories/users.repository";

declare global {
  namespace Express {
    interface Request {
      currentUser?: { id: number };
    }
  }
}

export async function demoAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const headerValue = req.header("X-Demo-UserId");

  if (!headerValue) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing X-Demo-UserId header" } });
    return;
  }

  const userId = Number(headerValue);
  if (!Number.isInteger(userId) || userId <= 0) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid X-Demo-UserId value" } });
    return;
  }

  const user = await usersRepo.getById(userId);
  if (!user) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "User not found" } });
    return;
  }

  req.currentUser = { id: userId };
  next();
}

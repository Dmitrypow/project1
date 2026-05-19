import { Request, Response, NextFunction } from "express";

export class ApiError extends Error {
  status: number;
  code: string;
  details: unknown;

  constructor(status: number, code: string, message: string, details: unknown = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const msg = String(err && (err as Error).message ? (err as Error).message : err);

  if (msg.includes("UNIQUE constraint failed")) {
    res.status(409).json({ error: { code: "CONFLICT", message: "Дані вже існують (порушено унікальність)" } });
    return;
  }
  if (msg.includes("FOREIGN KEY constraint failed")) {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Некоректний зв'язок (користувач або аудиторія не існує)" } });
    return;
  }
  if (msg.includes("NOT NULL constraint failed") || msg.includes("CHECK constraint failed")) {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Некоректні дані (порушено обмеження БД)", details: msg } });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Internal server error" },
  });
}

class ApiError extends Error {
  constructor(status, code, message, details = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function errorHandler(err, req, res, next) {
  const msg = String(err && err.message ? err.message : err);
  
  if (msg.includes("UNIQUE constraint failed")) {
    return res.status(409).json({ error: { code: "CONFLICT", message: "Дані вже існують (порушено унікальність)" } });
  }
  if (msg.includes("FOREIGN KEY constraint failed")) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Некоректний зв'язок (користувач або аудиторія не існує)" } });
  }
  if (msg.includes("NOT NULL constraint failed") || msg.includes("CHECK constraint failed")) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Некоректні дані (порушено обмеження БД)", details: msg } });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Internal server error" },
  });
}

module.exports = errorHandler;
module.exports.ApiError = ApiError;
import express from "express";
import { requestLogger } from "./middleware/request-logger.middleware";
import { errorHandler } from "./middleware/error-handler.middleware";
import usersRouter from "./routes/users.routes";
import passesRouter from "./routes/passes.routes";
import roomsRouter from "./routes/rooms.routes";
import { migrate } from "./db/migrate";

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(requestLogger);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.status(200).json({ ok: true }));
app.use("/api/users", usersRouter);
app.use("/api/passes", passesRouter);
app.use("/api/rooms", roomsRouter);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.originalUrl} not found` },
  });
});

// ─── Centralized error handler ────────────────────────────────────────────────
app.use(errorHandler);

// ─── Bootstrap ───────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  await migrate();
  app.listen(PORT, () => {
    console.log(`API started on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});

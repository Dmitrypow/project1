const express = require("express");
const requestLogger = require("./middleware/request-logger.middleware");
const errorHandler = require("./middleware/error-handler.middleware");
const usersRouter = require("./routes/users.routes");
const passesRouter = require("./routes/passes.routes");
const { migrate } = require("./db/migrate");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.json());
app.use(requestLogger);

// --- Routes ---
app.get("/health", (req, res) => res.status(200).json({ ok: true }));
app.use("/api/users", usersRouter);
app.use("/api/passes", passesRouter);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.originalUrl} not found` },
  });
});

// --- Centralized error handler (must be last) ---
app.use(errorHandler);

// --- Bootstrap ---
async function bootstrap() {
  await migrate(); // Створення таблиць
  app.listen(PORT, () => {
    console.log(`API started on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
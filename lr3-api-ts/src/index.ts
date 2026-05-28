import express from "express";
import cors from "cors";
import { requestLogger } from "./middleware/request-logger.middleware";
import { errorHandler } from "./middleware/error-handler.middleware";
import usersRouter from "./routes/users.routes";
import passesRouter from "./routes/passes.routes";
import zonesRouter from "./routes/zones.routes";
import { migrate } from "./db/migrate";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(requestLogger);

const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500"
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS: origin is not allowed"), false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors());

app.get("/health", (_req, res) => res.status(200).json({ ok: true }));
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/passes", passesRouter);
app.use("/api/v1/zones", zonesRouter);

app.use((req, res) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.originalUrl} not found` },
  });
});

app.use(errorHandler);

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
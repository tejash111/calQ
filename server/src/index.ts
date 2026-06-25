import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import { clerkAuth } from "./middleware/auth.js";
import { logger } from "./lib/logger.js";
import userRoutes from "./routes/users.js";
import onboardingRoutes from "./routes/onboarding.js";
import aiRoutes from "./routes/ai.js";
import foodRoutes from "./routes/food.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors()); // Allow all origins in dev
app.use(express.json({ limit: '10mb' }));

// Request logging with Morgan and Winston
const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }
);
app.use(morganMiddleware);

app.use(clerkAuth); // Clerk session parsing (does NOT block unauthenticated requests)

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/users", userRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/food", foodRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  logger.info("Health check endpoint pinged");
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );
  if (err.stack) {
    logger.error(err.stack);
  }

  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || "Internal Server Error",
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    },
  });
});

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(Number(PORT), "0.0.0.0", () => {
  logger.info(`🚀 calQ server running on http://0.0.0.0:${PORT}`);
});

// Trigger reload
export default app;

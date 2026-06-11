import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkAuth } from "./middleware/auth.js";
import userRoutes from "./routes/users.js";
import onboardingRoutes from "./routes/onboarding.js";
import aiRoutes from "./routes/ai.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors()); // Allow all origins in dev
app.use(express.json());
app.use(clerkAuth); // Clerk session parsing (does NOT block unauthenticated requests)

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/users", userRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/ai", aiRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 calQ server running on http://localhost:${PORT}`);
});

export default app;

import { Router } from "express";
import type { Request, Response } from "express";
import { generateNutritionPlan, type UserProfile } from "../lib/ai.js";
import { analyzeFood } from "../lib/ai-chat.js";
import { requireAuthentication } from "../middleware/auth.js";

const router = Router();

// POST /api/ai/nutrition-plan — generate nutrition plan via LangChain
router.post(
  "/nutrition-plan",
  async (req: Request, res: Response) => {
    try {
      const profile = req.body as UserProfile;

      // Validate required fields
      if (
        !profile.goal ||
        !profile.gender ||
        !profile.weight ||
        !profile.height ||
        !profile.birthYear ||
        !profile.activityLevel ||
        !profile.pace
      ) {
        res.status(400).json({ error: "Missing required profile fields" });
        return;
      }

      const plan = await generateNutritionPlan(profile);
      res.json(plan);
    } catch (error) {
      console.error("Error generating nutrition plan:", error);
      res.status(500).json({ error: "Failed to generate nutrition plan" });
    }
  }
);

// POST /api/ai/chat — AI food analysis chat with session memory
router.post(
  "/chat",
  async (req: Request, res: Response) => {
    try {
      const { message, sessionId } = req.body;

      if (!message || !sessionId) {
        res.status(400).json({ error: "Missing required fields: message, sessionId" });
        return;
      }

      const result = await analyzeFood(message, sessionId);
      res.json(result);
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ error: "Failed to analyze food. Please try again." });
    }
  }
);

export default router;

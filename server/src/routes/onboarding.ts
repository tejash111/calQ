import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuthentication, getUserId } from "../middleware/auth.js";

const router = Router();

// GET /api/onboarding — fetch onboarding profile for authenticated user
router.get("/", requireAuthentication, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const onboarding = await prisma.onboarding.findUnique({
      where: { userId },
      select: {
        dailyCalories: true,
        proteinG: true,
        carbsG: true,
        fatG: true,
        goal: true,
        weight: true,
        height: true,
        activityLevel: true,
      },
    });

    if (!onboarding) {
      res.status(404).json({ error: "Onboarding profile not found" });
      return;
    }

    // Map to the format the frontend expects (snake_case)
    res.json({
      daily_calories: onboarding.dailyCalories,
      protein_g: onboarding.proteinG,
      carbs_g: onboarding.carbsG,
      fat_g: onboarding.fatG,
      goal: onboarding.goal,
      weight: onboarding.weight,
      height: onboarding.height,
      activity_level: onboarding.activityLevel,
    });
  } catch (error) {
    console.error("Error fetching onboarding:", error);
    res.status(500).json({ error: "Failed to fetch onboarding profile" });
  }
});

// POST /api/onboarding — save/update onboarding data
router.post("/", requireAuthentication, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Ensure the user exists in the DB first (solves race condition with frontend useSyncUser)
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });

    const {
      goal,
      gender,
      weight,
      height,
      birth_day,
      birth_month,
      birth_year,
      desired_weight,
      activity_level,
      pace,
      connect_fit,
      daily_calories,
      protein_g,
      carbs_g,
      fat_g,
    } = req.body;

    const onboarding = await prisma.onboarding.upsert({
      where: { userId },
      update: {
        goal,
        gender,
        weight,
        height,
        birthDay: birth_day,
        birthMonth: birth_month,
        birthYear: birth_year,
        desiredWeight: desired_weight,
        activityLevel: activity_level,
        pace,
        connectFit: connect_fit,
        dailyCalories: daily_calories,
        proteinG: protein_g,
        carbsG: carbs_g,
        fatG: fat_g,
      },
      create: {
        userId,
        goal,
        gender,
        weight,
        height,
        birthDay: birth_day,
        birthMonth: birth_month,
        birthYear: birth_year,
        desiredWeight: desired_weight,
        activityLevel: activity_level,
        pace,
        connectFit: connect_fit,
        dailyCalories: daily_calories,
        proteinG: protein_g,
        carbsG: carbs_g,
        fatG: fat_g,
      },
    });

    res.json({ success: true, onboarding });
  } catch (error) {
    console.error("Error saving onboarding:", error);
    res.status(500).json({ error: "Failed to save onboarding data" });
  }
});

// POST /api/onboarding/weight — update weight and log history
router.post("/weight", requireAuthentication, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { weight } = req.body;
    if (!weight) {
      res.status(400).json({ error: "Weight is required" });
      return;
    }

    // 1. Create Weight Log
    const weightLog = await prisma.weightLog.create({
      data: {
        userId,
        weight: parseFloat(weight)
      }
    });

    // 2. Update Onboarding
    const onboarding = await prisma.onboarding.upsert({
      where: { userId },
      update: { weight: String(weight) },
      create: { userId, weight: String(weight) }
    });

    res.json({ success: true, weightLog, onboarding });
  } catch (error) {
    console.error("Error saving weight:", error);
    res.status(500).json({ error: "Failed to save weight data" });
  }
});

export default router;

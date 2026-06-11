import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuthentication, getUserId } from "../middleware/auth.js";

const router = Router();

// POST /api/users/sync — upsert user from Clerk session
router.post("/sync", requireAuthentication, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { email, firstName, lastName, imageUrl } = req.body;

    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        email,
        firstName,
        lastName,
        imageUrl,
      },
      create: {
        id: userId,
        email,
        firstName,
        lastName,
        imageUrl,
      },
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error syncing user:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
});

export default router;

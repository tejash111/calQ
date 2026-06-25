import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuthentication as requireAuth } from '../middleware/auth.js';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { ChatGroq } from '@langchain/groq';
import { HumanMessage } from '@langchain/core/messages';
import { logger } from '../lib/logger.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dr1gpbjgg',
  api_key: '867565821327189',
  api_secret: 'hmJXL0LVR7vR5aqxsq9R6ILDiY0',
});

const router = Router();

// Setup OAuth 1.0a
const oauth = new OAuth({
  consumer: {
    key: process.env.FATSECRET_CLIENT_ID || '',
    secret: process.env.FATSECRET_CLIENT_SECRET || '',
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

// Helper to make signed FatSecret API calls
async function fatSecretRequest(params: Record<string, string>) {
  const baseUrl = 'https://platform.fatsecret.com/rest/server.api';
  const requestData = {
    url: baseUrl,
    method: 'GET',
    data: { format: 'json', ...params },
  };
  const authHeaders = oauth.authorize(requestData);
  const signedUrl = baseUrl + '?' + new URLSearchParams({ ...requestData.data, ...authHeaders } as any).toString();

  const response = await fetch(signedUrl);
  if (!response.ok) {
    const errorText = await response.text();
    logger.error(`FatSecret API HTTP error: ${response.status} - ${errorText}`);
    throw new Error(`FatSecret API error: ${response.status}`);
  }

  const textData = await response.text();
  const data = JSON.parse(textData);

  if (data.error) {
    logger.error(`FatSecret API error: ${JSON.stringify(data.error)}`);
    throw new Error(data.error.message || 'FatSecret API error');
  }

  return data;
}

router.get('/search', requireAuth, async (req: Request, res: Response) => {
  const query = req.query.query as string;
  
  if (!query || query.length < 3) {
    return res.status(400).json({ error: 'Search query must be at least 3 characters long' });
  }

  try {
    const data = await fatSecretRequest({
      method: 'foods.search',
      search_expression: query,
      max_results: '5',
    });

    // The structure returned by fatsecret:
    // data.foods.food is either an array (multiple results), an object (single result), or undefined.
    let foods: any[] = [];
    if (data.foods && data.foods.food) {
       foods = Array.isArray(data.foods.food) ? data.foods.food : [data.foods.food];
    }

    // Map to a cleaner format for the frontend
    const results = foods.map((f: any) => ({
      id: f.food_id,
      name: f.food_name,
      description: f.food_description,
      url: f.food_url,
      type: f.food_type
    }));

    logger.info(`Food search: query="${query}", results=${results.length}`);
    res.json({ results });
  } catch (error: any) {
    logger.error(`Search error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error during food search' });
  }
});

// Qwen vision model for food scanning
const visionModel = new ChatGroq({
  model: 'qwen/qwen3.6-27b',
  apiKey: process.env.GROQ_API_KEY,
});

// POST /api/food/scan — Analyze a food image with Gemini
router.post('/scan', requireAuth, async (req: any, res: Response) => {
  try {
    const { imageBase64, hint } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const hintText = hint
      ? `\nThe user also provided this hint about the food: "${hint}". Use this to improve your analysis.`
      : '';

    const prompt = `You are a professional nutritionist AI. Analyze this food image and identify what food items are present.${hintText}

Return ONLY a valid JSON object with NO markdown formatting, no code blocks, no backticks. Just pure JSON:
{
  "name": "<name of the food>",
  "serving": "<estimated serving size, e.g. '1 medium banana', '1 cup rice'>",
  "calories": <number>,
  "protein": <number in grams>,
  "carbs": <number in grams>,
  "fat": <number in grams>,
  "fiber": <number in grams or null>,
  "sugar": <number in grams or null>,
  "sodium": <number in mg or null>,
  "potassium": <number in mg or null>,
  "calcium": <number in mg or null>,
  "iron": <number in mg or null>,
  "vitaminC": <number in mg or null>,
  "vitaminD": <number in mcg or null>
}

Be as accurate as possible with the nutritional estimates. If you cannot determine a micronutrient, set it to null.`;

    const message = new HumanMessage({
      content: [
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`,
          },
        },
        {
          type: 'text',
          text: prompt,
        },
      ],
    });

    const response = await visionModel.invoke([message], { response_format: { type: "json_object" } });

    // Extract text content from LangChain response
    const text =
      typeof response.content === 'string'
        ? response.content
        : Array.isArray(response.content)
          ? response.content
              .filter((block): block is { type: 'text'; text: string } =>
                typeof block === 'object' && block !== null && 'type' in block && block.type === 'text'
              )
              .map((block) => block.text)
              .join('')
          : String(response.content);

    // Strip <think> tags used by reasoning models
    const cleanText = text.replace(/<think>[\s\S]*?<\/think>/gi, '');

    // Extract JSON block using braces to ignore conversational fluff
    const startIndex = cleanText.indexOf('{');
    const endIndex = cleanText.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      console.error("RAW MODEL RESPONSE:", text);
      throw new Error("Model response did not contain a valid JSON object");
    }

    const jsonStr = cleanText.substring(startIndex, endIndex + 1);
    console.log('Model scan result:', jsonStr);

    const parsed = JSON.parse(jsonStr);

    // Upload image to Cloudinary
    let imageUrl: string | undefined;
    try {
      const uploadResult = await cloudinary.uploader.upload(`data:image/jpeg;base64,${imageBase64}`, {
        folder: 'calq_scans',
      });
      imageUrl = uploadResult.secure_url;
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
    }

    res.json({ result: parsed, imageUrl });
  } catch (error) {
    console.error('Food scan error:', error);
    res.status(500).json({ error: 'Failed to analyze food image' });
  }
});

// Create a new Prisma client instance for DB access
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// POST /api/food/log
router.post('/log', requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.auth().userId;
    const { foodId, name, imageUrl, calories, protein, carbs, fat, fiber, sugar, sodium, potassium, calcium, iron, vitaminC, vitaminD, serving, mealType } = req.body;

    if (!foodId || !name || calories === undefined || !mealType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const log = await prisma.foodLog.create({
      data: {
        userId,
        foodId,
        name,
        imageUrl,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        sugar,
        sodium,
        potassium,
        calcium,
        iron,
        vitaminC,
        vitaminD,
        serving,
        mealType
      }
    });

    logger.info(`Food logged: userId=${userId}, name="${name}", meal=${mealType}`);
    res.json({ success: true, log });
  } catch (error: any) {
    logger.error(`Error logging food: ${error.message}`);
    res.status(500).json({ error: 'Failed to log food' });
  }
});

// GET /api/food/log/today
router.get('/log/today', requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.auth().userId;
    const dateQuery = req.query.date as string;

    // Get start and end of the requested date (or today if none provided)
    const startOfDay = dateQuery ? new Date(dateQuery) : new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await prisma.foodLog.findMany({
      where: {
        userId,
        consumedAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: {
        consumedAt: 'desc'
      }
    });

    logger.info(`Today's food logs fetched: userId=${userId}, count=${logs.length}`);
    res.json({ logs });
  } catch (error: any) {
    logger.error(`Error fetching today logs: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch food logs' });
  }
});

// GET /api/food/log/week — Fetch current week's food logs for analytics
router.get('/log/week', requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.auth().userId;

    // Calculate start of current week (Sunday) and end (Saturday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Go to Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    const logs = await prisma.foodLog.findMany({
      where: {
        userId,
        consumedAt: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      orderBy: {
        consumedAt: 'asc',
      },
    });

    // Group by day-of-week (0=Sun, 1=Mon, ..., 6=Sat)
    const dailyData = Array.from({ length: 7 }, (_, i) => ({
      day: i,
      consumed: 0,
      burned: 0, // placeholder — no exercise logging yet
      logCount: 0,
    }));

    for (const log of logs) {
      const dayIndex = new Date(log.consumedAt).getDay();
      if (dailyData[dayIndex]) {
        dailyData[dayIndex].consumed += log.calories || 0;
        dailyData[dayIndex].logCount += 1;
      }
    }

    const totalConsumed = dailyData.reduce((s, d) => s + d.consumed, 0);
    const totalBurned = dailyData.reduce((s, d) => s + d.burned, 0);

    logger.info(`Weekly food logs fetched: userId=${userId}, totalLogs=${logs.length}`);
    res.json({
      dailyData,
      totalConsumed,
      totalBurned,
      netEnergy: totalConsumed - totalBurned,
      weekStart: startOfWeek.toISOString(),
      weekEnd: endOfWeek.toISOString(),
    });
  } catch (error: any) {
    logger.error(`Error fetching weekly logs: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch weekly food logs' });
  }
});

// GET /api/food/:id — Fetch full food detail with images using food.get.v5
// NOTE: This route MUST be last since /:id is a catch-all param
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const foodId = req.params.id;

  if (!foodId) {
    return res.status(400).json({ error: 'Food ID is required' });
  }

  try {
    const data = await fatSecretRequest({
      method: 'food.get.v5',
      food_id: foodId as string,
      include_food_images: 'true',
      include_food_attributes: 'true',
    });

    const food = data.food;
    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }

    // Extract the best image (prefer largest size, image_type "1" = photograph)
    let imageUrl: string | null = null;
    if (food.food_images && food.food_images.food_image) {
      const images = Array.isArray(food.food_images.food_image)
        ? food.food_images.food_image
        : [food.food_images.food_image];

      const bestImage = images.find((img: any) =>
        img.image_url && img.image_url.includes('1024x1024')
      ) || images.find((img: any) =>
        img.image_url && img.image_url.includes('400x400')
      ) || images[0];

      if (bestImage) {
        imageUrl = bestImage.image_url;
      }
    }

    // Extract servings
    let servings: any[] = [];
    if (food.servings && food.servings.serving) {
      servings = Array.isArray(food.servings.serving)
        ? food.servings.serving
        : [food.servings.serving];
    }

    const result = {
      id: food.food_id,
      name: food.food_name,
      brandName: food.brand_name || null,
      type: food.food_type,
      url: food.food_url,
      imageUrl,
      servings: servings.map((s: any) => ({
        id: s.serving_id,
        description: s.serving_description,
        calories: parseFloat(s.calories) || 0,
        protein: parseFloat(s.protein) || 0,
        carbs: parseFloat(s.carbohydrate) || 0,
        fat: parseFloat(s.fat) || 0,
        fiber: parseFloat(s.fiber) || 0,
        sugar: parseFloat(s.sugar) || 0,
        sodium: parseFloat(s.sodium) || 0,
        potassium: parseFloat(s.potassium) || 0,
        calcium: parseFloat(s.calcium) || 0,
        iron: parseFloat(s.iron) || 0,
        isDefault: s.is_default === '1',
        metricAmount: parseFloat(s.metric_serving_amount) || 0,
        metricUnit: s.metric_serving_unit || 'g',
      })),
    };

    logger.info(`Food detail fetched: id=${foodId}, name="${result.name}", hasImage=${!!imageUrl}`);
    res.json(result);
  } catch (error: any) {
    logger.error(`Food detail error for id=${foodId}: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch food details' });
  }
});

export default router;

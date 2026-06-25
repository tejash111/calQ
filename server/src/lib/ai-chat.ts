import { ChatGroq } from "@langchain/groq";
import { HumanMessage, AIMessage, SystemMessage, type BaseMessage } from "@langchain/core/messages";

// ─── Session Memory Store ────────────────────────────────────────────────────
// Modern LangChain approach: manual message history arrays per session
// No deprecated BufferMemory — just arrays of BaseMessage

const sessionStore = new Map<string, BaseMessage[]>();

// Cleanup sessions older than 2 hours
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const sessionTimestamps = new Map<string, number>();

function cleanupStaleSessions() {
  const now = Date.now();
  for (const [id, ts] of sessionTimestamps.entries()) {
    if (now - ts > SESSION_TTL_MS) {
      sessionStore.delete(id);
      sessionTimestamps.delete(id);
    }
  }
}

// Run cleanup every 30 minutes
setInterval(cleanupStaleSessions, 30 * 60 * 1000);

// ─── Model ───────────────────────────────────────────────────────────────────
const model = new ChatGroq({
  model: "openai/gpt-oss-120b",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.3,
});

// ─── System Prompt ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a certified nutritionist and food analysis AI for a calorie tracking app called calQ.

Your primary job is to analyze food descriptions from users and return accurate nutritional information.

When a user describes what they ate, you MUST:
1. Identify each individual food item and its quantity
2. Calculate the nutritional breakdown for each item
3. Provide totals across all items

IMPORTANT RULES:
- Always respond with valid JSON — no markdown, no code blocks, no extra text
- Use your nutritional knowledge database for accurate values
- If quantities are ambiguous (e.g. "a scoop of protein"), use standard serving sizes
- For "a scoop" of protein powder, assume ~30g (one standard scoop)
- For milk, if no fat % specified, assume whole milk
- Round all values to 1 decimal place
- If the user asks a general nutrition question (not food logging), set "type" to "chat" and provide a text response

Response format for food analysis:
{
  "type": "food_analysis",
  "items": [
    {
      "name": "Food Name",
      "quantity": "100g",
      "calories": 389,
      "protein": 16.9,
      "carbs": 66.3,
      "fat": 6.9,
      "fiber": 10.6,
      "sugar": 0
    }
  ],
  "totals": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "fiber": 0,
    "sugar": 0
  },
  "summary": "Brief summary of the meal analysis"
}

Response format for general chat:
{
  "type": "chat",
  "message": "Your helpful response here"
}

Remember: ONLY output the JSON object, nothing else.`;

// ─── Chat Function ───────────────────────────────────────────────────────────
export interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

export interface FoodAnalysisResult {
  type: "food_analysis";
  items: FoodItem[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  summary: string;
}

export interface ChatResult {
  type: "chat";
  message: string;
}

export type AIResponse = FoodAnalysisResult | ChatResult;

export async function analyzeFood(
  message: string,
  sessionId: string
): Promise<AIResponse> {
  // Get or create session history
  if (!sessionStore.has(sessionId)) {
    sessionStore.set(sessionId, []);
  }
  sessionTimestamps.set(sessionId, Date.now());

  const history = sessionStore.get(sessionId)!;

  // Build message array: system + history + new user message
  const messages: BaseMessage[] = [
    new SystemMessage(SYSTEM_PROMPT),
    ...history,
    new HumanMessage(message),
  ];

  const response = await model.invoke(messages, { response_format: { type: "json_object" } });

  // Extract text content
  const text =
    typeof response.content === "string"
      ? response.content
      : Array.isArray(response.content)
        ? response.content
            .filter(
              (block): block is { type: "text"; text: string } =>
                typeof block === "object" &&
                block !== null &&
                "type" in block &&
                block.type === "text"
            )
            .map((block) => block.text)
            .join("")
        : String(response.content);

  // Strip <think> tags used by reasoning models
  const cleanText = text.replace(/<think>[\s\S]*?<\/think>/gi, '');

  // Extract JSON block using braces to ignore conversational fluff
  const startIndex = cleanText.indexOf('{');
  const endIndex = cleanText.lastIndexOf('}');

  if (startIndex === -1 || endIndex === -1) {
    throw new Error("Model response did not contain a valid JSON object");
  }

  const jsonStr = cleanText.substring(startIndex, endIndex + 1);

  // Parse the response
  const parsed = JSON.parse(jsonStr) as AIResponse;

  // Update session history (keep last 20 messages to prevent context overflow)
  history.push(new HumanMessage(message));
  history.push(new AIMessage(text));

  if (history.length > 20) {
    // Keep only the last 20 messages
    sessionStore.set(sessionId, history.slice(-20));
  }

  return parsed;
}

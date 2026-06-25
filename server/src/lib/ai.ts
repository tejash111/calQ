import { ChatGroq } from "@langchain/groq";

const model = new ChatGroq({
  model: "openai/gpt-oss-120b",
  apiKey: process.env.GROQ_API_KEY,
});

export interface NutritionPlan {
  dailyCalories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  summary: string;
  tips: string[];
}

export interface UserProfile {
  goal: string;
  gender: string;
  weight: string;
  height: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  desiredWeight?: string;
  activityLevel: string;
  pace: string;
}

export async function generateNutritionPlan(
  profile: UserProfile
): Promise<NutritionPlan> {
  const age = new Date().getFullYear() - parseInt(profile.birthYear);

  const prompt = `
You are a certified nutritionist and dietitian. Based on the following user profile, calculate their precise daily nutrition requirements.

User Profile:
- Goal: ${profile.goal.replace("_", " ")}
- Gender: ${profile.gender}
- Current Weight: ${profile.weight}
- Height: ${profile.height}
- Age: ${age} years old (born ${profile.birthDay} ${profile.birthMonth} ${profile.birthYear})
- Target Weight: ${profile.desiredWeight || "Same as current (maintenance)"}
- Activity Level: ${profile.activityLevel.replace("_", " ")}
- Pace: ${profile.pace}

Calculate using the Mifflin-St Jeor equation for BMR, then apply the appropriate TDEE activity multiplier. Adjust calories based on goal and pace:
- Slow pace: ±250 kcal/day deficit or surplus
- Balanced pace: ±500 kcal/day deficit or surplus  
- Aggressive pace: ±750 kcal/day deficit or surplus

For macros, use:
- Protein: 1.6-2.2g per kg of bodyweight (higher for muscle gain)
- Fat: 25-35% of total calories
- Carbohydrates: remaining calories

Return ONLY a valid JSON object with NO markdown formatting, no code blocks, no backticks. Just pure JSON:
{
  "dailyCalories": <number>,
  "protein": <number in grams>,
  "carbohydrates": <number in grams>,
  "fat": <number in grams>,
  "summary": "<2-3 sentence personalized explanation>",
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}
`;

  const response = await model.invoke(prompt, { response_format: { type: "json_object" } });

  // Extract text content from LangChain response
  const text =
    typeof response.content === "string"
      ? response.content
      : Array.isArray(response.content)
        ? response.content
            .filter((block): block is { type: "text"; text: string } => 
              typeof block === "object" && block !== null && "type" in block && block.type === "text"
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
  const parsed = JSON.parse(jsonStr) as NutritionPlan;
  return parsed;
}

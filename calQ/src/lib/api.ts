import { useAuth } from "@clerk/clerk-expo";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

// ─── Types (shared with server) ──────────────────────────────────────────────

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

// ─── API Client ──────────────────────────────────────────────────────────────

export async function apiClient(
  path: string,
  token: string | null,
  options: RequestInit = {}
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorText = await response.text().catch(() => "Unknown error");
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.error || `API error: ${response.status}`);
    } catch {
      throw new Error(`API error ${response.status}: ${errorText.substring(0, 100)}`);
    }
  }

  return response.json();
}

// ─── API Functions ───────────────────────────────────────────────────────────

export async function syncUser(
  token: string,
  userData: {
    email?: string;
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string;
  }
) {
  return apiClient("/api/users/sync", token, {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function getOnboardingProfile(token: string) {
  return apiClient("/api/onboarding", token);
}

export async function saveOnboarding(
  token: string,
  data: Record<string, unknown>
) {
  return apiClient("/api/onboarding", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function generateNutritionPlan(
  token: string | null,
  profile: UserProfile
): Promise<NutritionPlan> {
  return apiClient("/api/ai/nutrition-plan", token, {
    method: "POST",
    body: JSON.stringify(profile),
  });
}

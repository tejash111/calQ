import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { getOnboardingProfile } from '../lib/api';

export interface OnboardingProfile {
  daily_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  goal: string;
  weight: string;
  height: string;
  activity_level: string;
}

export function useOnboardingProfile() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        if (!token) {
          setError('No auth token available');
          return;
        }

        const data = await getOnboardingProfile(token);
        setProfile(data as OnboardingProfile);
      } catch (e: any) {
        // 404 means no profile yet — not a real error
        if (e?.message?.includes('not found')) {
          setProfile(null);
        } else {
          setError(e?.message ?? 'Unknown error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, isLoaded]);

  return { profile, loading, error };
}

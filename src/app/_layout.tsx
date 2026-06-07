import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from "expo-router";
import '../../global.css';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '../lib/clerk';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSyncUser } from '../hooks/useSyncUser';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
}

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Initialize the user sync hook
  useSyncUser();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isLandingPage = segments.length === 0 || segments[0] === 'index';
    const isOnboarding = segments[0] === 'onboarding';

    if (isSignedIn && (inAuthGroup || isLandingPage || isOnboarding)) {
      // If signed in and on public pages, go to dashboard
      router.replace('/(app)/dashboard');
    } else if (!isSignedIn && !inAuthGroup && !isLandingPage && !isOnboarding) {
      // If not signed in and trying to access protected routes, go to landing
      router.replace('/');
    }
  }, [isSignedIn, isLoaded, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)/sign-in" />
      <Stack.Screen name="onboarding/index" />
      <Stack.Screen name="(app)/dashboard/index" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <InitialLayout />
        </ClerkLoaded>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

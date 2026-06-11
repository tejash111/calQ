import { useEffect } from 'react';
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import '../../global.css';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '../lib/clerk';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, View } from 'react-native';
import { useSyncUser } from '../hooks/useSyncUser';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
}

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  // Initialize the user sync hook
  useSyncUser();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';
    const isLandingPage = pathname === '/';

    if (isSignedIn && (inAuthGroup || isLandingPage)) {
      // Signed-in user is on a public page (landing / auth) → send to dashboard
      // NOTE: onboarding is intentionally excluded so sign-up flow can land there
      router.replace('/dashboard');
    } else if (!isSignedIn && inAppGroup) {
      // Not signed-in user trying to access a protected screen → back to landing
      router.replace('/');
    }
  }, [isSignedIn, isLoaded, pathname, segments]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#A3E635" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)/sign-in" />
      <Stack.Screen name="(auth)/sign-up" />
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

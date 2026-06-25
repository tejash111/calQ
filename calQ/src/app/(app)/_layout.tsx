import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';

export default function AppLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard/index" />
      <Stack.Screen name="food-database" />
      <Stack.Screen name="food-detail" />
      <Stack.Screen name="personal-details" />
      <Stack.Screen name="scan-food" />
      <Stack.Screen name="scan-preview" />
      <Stack.Screen name="scan-results" />
    </Stack>
  );
}

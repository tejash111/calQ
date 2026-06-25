import { useCallback, useState } from 'react';
import { View, Text } from 'react-native';
import { Link, Redirect, useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@clerk/clerk-expo';
import { SwipeButton } from '../components/SwipeButton';

export default function MainScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [swipeKey, setSwipeKey] = useState(0);

  if (!isLoaded) {
    return null;
  }

  // If user is already signed in, send them to the dashboard
  if (isSignedIn) {
    return <Redirect href="/dashboard" />;
  }

  useFocusEffect(
    useCallback(() => {
      setSwipeKey((currentKey) => currentKey + 1);
    }, []),
  );

  const handleGetStarted = async () => {
    await AsyncStorage.removeItem('calq_onboarding_data');
    router.push('/onboarding');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <View className="flex-1 px-6 pt-3 pb-8 justify-between">

        <Text className="text-black text-2xl font-bold mt-4">calQ</Text>

        <View className="flex-1 items-center justify-start pt-2 mb-8">
          <View className="w-full aspect-square items-center justify-center">
            <LottieView
              source={require('../../assets/hero.json')}
              autoPlay
              loop
              style={{ width: '100%', height: '100%' }}
            />
          </View>
          <Text className="text-black text-3xl font-semibold text-center leading-10 mt-4">
            Every calorie, every step, perfectly tracked.
          </Text>
        </View>

        <View className="w-full items-center gap-6 pb-2">
          <Link href="/sign-in" asChild>
            <Text className="text-gray-500 font-medium text-base">
              I already have an account, <Text className="text-black font-bold">Sign In</Text>
            </Text>
          </Link>
          <SwipeButton key={swipeKey} onComplete={handleGetStarted} />
        </View>

      </View>
    </SafeAreaView>
  );
}

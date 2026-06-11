import { useCallback, useState } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { SwipeButton } from '../components/SwipeButton';

export default function MainScreen() {
  const router = useRouter();
  const [swipeKey, setSwipeKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setSwipeKey((currentKey) => currentKey + 1);
    }, []),
  );

  const handleGetStarted = () => {
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
          <Link href="/(auth)/sign-in" asChild>
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

import { View, Text, SafeAreaView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SwipeButton } from '../components/SwipeButton';

export default function MainScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/onboarding');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <View className="flex-1 px-6 pt-10 pb-8 justify-between">
        
        {/* Top Part: SVG Animation Placeholder */}
        <View className="flex-1 items-center justify-center mt-10 mb-12">
          <View className="w-full aspect-square border-2 border-gray-200 rounded-[40px] items-center justify-center bg-white shadow-sm">
            <Text className="text-gray-400 font-medium text-lg text-center px-8">
              (SVG Animation Placeholder)
            </Text>
          </View>
        </View>

        {/* Bottom Part */}
        <View className="w-full items-center gap-6 pb-2">
          <Link href="/(auth)/sign-in" asChild>
            <Text className="text-gray-500 font-medium text-base">
              I already have an account, <Text className="text-black font-bold">Sign In</Text>
            </Text>
          </Link>
          <SwipeButton onComplete={handleGetStarted} />
        </View>

      </View>
    </SafeAreaView>
  );
}

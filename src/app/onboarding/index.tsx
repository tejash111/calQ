import React from 'react';
import { View, Text } from 'react-native';

export default function OnboardingScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-3xl font-bold text-black">Onboarding</Text>
      <Text className="text-black mt-4">We will start onboarding here...</Text>
    </View>
  );
}

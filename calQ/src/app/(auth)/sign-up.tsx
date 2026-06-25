import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth } from '@clerk/clerk-expo';
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  useWarmUpBrowser();
  const router = useRouter();

  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/oauth-native-callback'),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        
        // Check if they have pending onboarding data to auto-save
        const localDataStr = await AsyncStorage.getItem('calq_onboarding_data');
        if (localDataStr) {
          const localData = JSON.parse(localDataStr);
          if (localData.nutrition) {
            router.replace('/onboarding');
            return;
          }
        }
        
        // Otherwise straight to dashboard
        router.replace('/dashboard');
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <View className="flex-1 px-6 pt-10 pb-8 justify-center">
        
        <View className="items-center mb-16">
          <Image 
            source={require('../../../assets/auth/signup.png')} 
            style={{ width: 180, height: 180, marginBottom: 24 }} 
            contentFit="contain" 
          />
          <Text className="text-black text-3xl font-normal tracking-tight text-center">
            Create Account
          </Text>
          <Text className="text-gray-500 text-lg mt-4 text-center px-4">
            Sign up to start tracking your calories and stay healthy.
          </Text>
        </View>
        
        <TouchableOpacity 
          onPress={onPress} 
          activeOpacity={0.8}
          className="w-full bg-[#d2cce3] flex-row items-center justify-center rounded-2xl border border-gray-200 shadow-sm shadow-black/5"
          style={{ padding: 16 }}
        >
          <Image 
            source={require('../../../assets/google.svg')} 
            style={{ width: 24, height: 24, marginRight: 12 }} 
            contentFit="contain" 
          />
          <Text className="text-black  font-semibold text-lg">Continue with Google</Text>
        </TouchableOpacity>

        <View className="mt-8 items-center">
          <TouchableOpacity onPress={() => router.replace('/sign-in')}>
            <Text className="text-gray-500 font-medium text-base">
              Already have an account? <Text className="text-black font-bold">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

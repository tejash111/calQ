import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth } from '@clerk/clerk-expo';
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
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
        
        // If they have pending onboarding data, send them to onboarding to auto-save
        const localDataStr = await AsyncStorage.getItem('calq_onboarding_data');
        if (localDataStr) {
          const localData = JSON.parse(localDataStr);
          if (localData.nutrition) {
            router.replace('/onboarding');
            return;
          }
        }
        
        // Otherwise, send returning users straight to their dashboard
        router.replace('/dashboard');
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <View className="flex-1 px-6 pt-2 pb-8">
        
        <TouchableOpacity 
          onPress={() => router.replace('/')} 
          className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-200 shadow-sm shadow-black/5 mb-8"
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>

        <View className="flex-1 justify-center">
          <View className="items-center mb-16">
            <Image 
              source={require('../../../assets/auth/login.png')} 
              style={{ width: 180, height: 180, marginBottom: 24 }} 
              contentFit="contain" 
            />
          <Text className="text-black text-3xl font-normal tracking-tight text-center">
            Welcome Back
          </Text>
          <Text className="text-gray-500 text-lg mt-4 text-center px-4">
            Sign in to continue tracking your calories and stay healthy.
          </Text>
        </View>
        
        <TouchableOpacity 
          onPress={onPress} 
          activeOpacity={0.8}
          className="w-full bg-[#F3F4F6] flex-row items-center justify-center rounded-2xl border border-gray-200 shadow-sm shadow-black/5"
          style={{ paddingVertical: 14 }}
        >
          <Image 
            source={require('../../../assets/google.svg')} 
            style={{ width: 24, height: 24, marginRight: 12 }} 
            contentFit="contain" 
          />
          <Text className="text-black font-semibold text-lg">Continue with Google</Text>
        </TouchableOpacity>

        </View>

      </View>
    </SafeAreaView>
  );
}

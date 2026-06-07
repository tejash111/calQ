import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth } from '@clerk/clerk-expo';
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser';
import { Leaf } from 'lucide-react-native';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onPress = React.useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        setActive({ session: createdSessionId });
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <View className="flex-1 px-6 pt-10 pb-8 justify-center">
        
        <View className="items-center mb-16">
          <View className="bg-[#A3E635]/20 p-6 rounded-full mb-6">
            <Leaf size={48} color="#A3E635" fill="#A3E635" />
          </View>
          <Text className="text-black text-[42px] font-bold tracking-tighter text-center">
            Welcome{'\n'}Back
          </Text>
          <Text className="text-gray-500 text-lg mt-4 text-center px-4">
            Sign in to continue tracking your calories and stay healthy.
          </Text>
        </View>
        
        <TouchableOpacity 
          onPress={onPress} 
          activeOpacity={0.8}
          className="w-full bg-white flex-row items-center justify-center py-5 rounded-2xl border border-gray-200 shadow-sm shadow-black/5"
        >
          {/* Simple placeholder for Google Logo */}
          <View className="w-6 h-6 rounded-full bg-red-500 mr-3 items-center justify-center">
             <Text className="text-white font-bold text-xs">G</Text>
          </View>
          <Text className="text-black font-semibold text-lg">Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          activeOpacity={0.8}
          className="w-full bg-[#A3E635] flex-row items-center justify-center py-5 rounded-2xl mt-4 shadow-sm shadow-black/5"
        >
          <Text className="text-black font-semibold text-lg">Continue with Email</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

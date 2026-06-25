import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import { imageStore } from '../../lib/imageStore';

const { width } = Dimensions.get('window');

export default function ScanPreviewScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{
    imageUri: string;
  }>();

  const [hint, setHint] = useState('');

  const handleAnalyze = () => {
    router.push({
      pathname: '/(app)/scan-results',
      params: {
        imageUri,
        hint: hint.trim() || '',
      },
    });
  };

  const base64 = imageStore.getBase64();
  const imageSource = base64 ? `data:image/jpeg;base64,${base64}` : imageUri;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Full Background Image */}
      <Image
        source={{ uri: imageSource }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      {/* Top Left Close Button */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={24} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.bottomSection}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.hintInput}
              value={hint}
              onChangeText={setHint}
              placeholder="Add a note to your meal to help our algorithm with things it can't see. This step is optional."
              placeholderTextColor="#A1A1AA"
              multiline={true}
              returnKeyType="done"
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyze} activeOpacity={0.8}>
              <Text style={styles.analyzeBtnText}>Analyze Food</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    backgroundColor: 'rgba(245, 245, 245, 0.9)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  hintInput: {
    height: 120,
    padding: 16,
    fontSize: 15,
    color: '#000',
    fontWeight: '400',
  },
  analyzeBtn: {
    backgroundColor: '#333333',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
    borderRadius: 8,
  },
  analyzeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

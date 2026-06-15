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
import { ArrowLeft, Sparkles, SkipForward } from 'lucide-react-native';

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

  const handleSkip = () => {
    router.push({
      pathname: '/(app)/scan-results',
      params: {
        imageUri,
        hint: '',
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Preview</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Image preview */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
          />
        </View>

        {/* Hint input area */}
        <View style={styles.hintSection}>
          <Text style={styles.hintLabel}>
            Add details to improve accuracy
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.hintInput}
              value={hint}
              onChangeText={setHint}
              placeholder="e.g. 2 eggs, with cheese, homemade..."
              placeholderTextColor="#9CA3AF"
              multiline={false}
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
            <SkipForward size={20} color="#6B7280" strokeWidth={2} />
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyze} activeOpacity={0.7}>
            <Sparkles size={20} color="#000" strokeWidth={2.5} />
            <Text style={styles.analyzeBtnText}>Analyze Food</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  imageContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  hintSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  hintLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hintInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 12,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skipBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  analyzeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: '#A3E635',
    shadowColor: '#A3E635',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  analyzeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});

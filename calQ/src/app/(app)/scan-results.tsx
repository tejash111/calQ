import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Animated,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Image } from 'expo-image';
import { ArrowLeft, Flame, Drumstick, Wheat, Droplets, Check } from 'lucide-react-native';
import { scanFood, logFood } from '../../lib/api';
import { imageStore } from '../../lib/imageStore';

const { width } = Dimensions.get('window');

interface ScanResult {
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  potassium: number | null;
  calcium: number | null;
  iron: number | null;
  vitaminC: number | null;
  vitaminD: number | null;
}

export default function ScanResultsScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { imageUri, hint } = useLocalSearchParams<{
    imageUri: string;
    hint: string;
  }>();

  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string>('Lunch');
  const [isLogging, setIsLogging] = useState(false);

  // Scanning animation
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start scanning animation
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    // Call the API
    analyzeFood();

    return () => {
      loop.stop();
      imageStore.clear();
    };
  }, []);

  const analyzeFood = async () => {
    try {
      const token = await getToken();
      const base64 = imageStore.getBase64();
      if (!base64) {
        throw new Error('Image data not found. Please try scanning again.');
      }
      const data = await scanFood(token, base64, hint || undefined);
      setResult(data.result);
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err.message || 'Failed to analyze food');
    } finally {
      setLoading(false);
    }
  };

  const handleLogFood = async () => {
    if (!result) return;
    setIsLogging(true);
    try {
      const token = await getToken();
      await logFood(token, {
        foodId: `scan_${Date.now()}`,
        name: result.name,
        imageUrl: imageUri || null,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
        fiber: result.fiber,
        sugar: result.sugar,
        sodium: result.sodium,
        potassium: result.potassium,
        calcium: result.calcium,
        iron: result.iron,
        vitaminC: result.vitaminC,
        vitaminD: result.vitaminD,
        serving: result.serving,
        mealType: selectedMeal,
      });
      router.dismissAll();
      router.replace('/dashboard');
    } catch (err) {
      console.error('Log error:', err);
      Alert.alert('Error', 'Failed to log food. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.55],
  });

  const MEAL_OPTIONS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  const micronutrients = result
    ? [
        { label: 'Fiber', value: result.fiber, unit: 'g' },
        { label: 'Sugar', value: result.sugar, unit: 'g' },
        { label: 'Sodium', value: result.sodium, unit: 'mg' },
        { label: 'Potassium', value: result.potassium, unit: 'mg' },
        { label: 'Calcium', value: result.calcium, unit: 'mg' },
        { label: 'Iron', value: result.iron, unit: 'mg' },
        { label: 'Vitamin C', value: result.vitaminC, unit: 'mg' },
        { label: 'Vitamin D', value: result.vitaminD, unit: 'mcg' },
      ]
    : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {loading ? 'Analyzing...' : 'Results'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image with scan overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
          />
          {loading && (
            <View style={styles.scanOverlay}>
              <Animated.View
                style={[
                  styles.scanLine,
                  { transform: [{ translateY: scanLineTranslateY }] },
                ]}
              />
            </View>
          )}
        </View>

        {/* Loading skeleton */}
        {loading && !error && (
          <View style={styles.content}>
            {/* Name skeleton */}
            <View style={styles.skeletonRow}>
              <View style={[styles.skeleton, { width: '60%', height: 28 }]} />
              <View style={[styles.skeleton, { width: '30%', height: 16, marginTop: 8 }]} />
            </View>

            {/* Calories skeleton */}
            <View style={[styles.skeleton, { width: '100%', height: 80, borderRadius: 20, marginTop: 20 }]} />

            {/* Macro skeletons */}
            <View style={styles.macroSkeletonRow}>
              <View style={[styles.skeleton, { flex: 1, height: 90, borderRadius: 16 }]} />
              <View style={[styles.skeleton, { flex: 1, height: 90, borderRadius: 16 }]} />
              <View style={[styles.skeleton, { flex: 1, height: 90, borderRadius: 16 }]} />
            </View>

            {/* Micro skeletons */}
            <View style={styles.microSkeletonGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <View key={i} style={[styles.skeleton, { width: '47%', height: 50, borderRadius: 12 }]} />
              ))}
            </View>
          </View>
        )}

        {/* Error state */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => { setError(null); setLoading(true); analyzeFood(); }}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Results */}
        {result && !loading && (
          <View style={styles.content}>
            {/* Food name */}
            <Text style={styles.foodName}>{result.name}</Text>
            <Text style={styles.foodServing}>{result.serving}</Text>

            {/* Calories card */}
            <View style={styles.calorieCard}>
              <Flame size={24} color="#EF4444" strokeWidth={2.5} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.calorieValue}>{result.calories}</Text>
                <Text style={styles.calorieLabel}>Calories</Text>
              </View>
            </View>

            {/* Macros */}
            <Text style={styles.sectionTitle}>Macronutrients</Text>
            <View style={styles.macroRow}>
              <View style={[styles.macroCard, { backgroundColor: '#FEF2F2' }]}>
                <Text style={[styles.macroValue, { color: '#EF4444' }]}>{result.protein}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>
              <View style={[styles.macroCard, { backgroundColor: '#FFFBEB' }]}>
                <Text style={[styles.macroValue, { color: '#F59E0B' }]}>{result.carbs}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
              <View style={[styles.macroCard, { backgroundColor: '#EFF6FF' }]}>
                <Text style={[styles.macroValue, { color: '#3B82F6' }]}>{result.fat}g</Text>
                <Text style={styles.macroLabel}>Fat</Text>
              </View>
            </View>

            {/* Micros */}
            <Text style={styles.sectionTitle}>Micronutrients</Text>
            <View style={styles.microGrid}>
              {micronutrients.map((m) => (
                <View key={m.label} style={styles.microCard}>
                  <Text style={styles.microValue}>
                    {m.value !== null ? m.value : '—'}
                    {m.value !== null && <Text style={styles.microUnit}> {m.unit}</Text>}
                  </Text>
                  <Text style={styles.microLabel}>{m.label}</Text>
                </View>
              ))}
            </View>

            {/* Meal type selector */}
            <Text style={styles.sectionTitle}>Log to Meal</Text>
            <View style={styles.mealRow}>
              {MEAL_OPTIONS.map((meal) => (
                <TouchableOpacity
                  key={meal}
                  style={[
                    styles.mealPill,
                    selectedMeal === meal && styles.mealPillActive,
                  ]}
                  onPress={() => setSelectedMeal(meal)}
                >
                  <Text
                    style={[
                      styles.mealPillText,
                      selectedMeal === meal && styles.mealPillTextActive,
                    ]}
                  >
                    {meal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Log button fixed at bottom */}
      {result && !loading && (
        <View style={styles.logBtnContainer}>
          <TouchableOpacity
            style={[styles.logBtn, isLogging && { opacity: 0.6 }]}
            onPress={handleLogFood}
            disabled={isLogging}
            activeOpacity={0.7}
          >
            {isLogging ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Check size={22} color="#000" strokeWidth={2.5} />
                <Text style={styles.logBtnText}>Log Food</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
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
    paddingBottom: 12,
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
  // Image
  imageContainer: {
    marginHorizontal: 20,
    height: width * 0.6,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.15)',
    overflow: 'hidden',
  },
  scanLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#A3E635',
    shadowColor: '#A3E635',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  // Content
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  foodName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.5,
  },
  foodServing: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  // Calories
  calorieCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  calorieValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -1,
  },
  calorieLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Sections
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginTop: 28,
    marginBottom: 12,
  },
  // Macros
  macroRow: {
    flexDirection: 'row',
    gap: 10,
  },
  macroCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  macroValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  macroLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  // Micros
  microGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  microCard: {
    width: (width - 50) / 2,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  microValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  microUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  microLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  // Meal selector
  mealRow: {
    flexDirection: 'row',
    gap: 10,
  },
  mealPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  mealPillActive: {
    backgroundColor: '#A3E635',
    borderColor: '#A3E635',
  },
  mealPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  mealPillTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  // Log button
  logBtnContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    backgroundColor: '#F8F9FA',
  },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#A3E635',
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: '#A3E635',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  logBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  // Skeletons
  skeletonRow: {
    gap: 4,
  },
  skeleton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  macroSkeletonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  microSkeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  // Error
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  retryBtn: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

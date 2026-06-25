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
  TextInput,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Image } from 'expo-image';
import { ArrowLeft, Minus, Plus } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { scanFood, logFood } from '../../lib/api';
import { imageStore } from '../../lib/imageStore';

const { width, height } = Dimensions.get('window');

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

const MEAL_OPTIONS = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
const LOADING_STEPS = [
  'Capturing your document...',
  'Analyzing ingredients...',
  'Calculating macros...',
  'Preparing results...',
];

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
  const [showMealModal, setShowMealModal] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [cloudImageUrl, setCloudImageUrl] = useState<string | null>(null);

  const [quantityStr, setQuantityStr] = useState('1');
  const quantity = parseFloat(quantityStr) || 0;

  const [loadingStep, setLoadingStep] = useState(0);

  // Scanning animation
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Retrieve base64 from imageStore to ensure visibility
  const base64 = imageStore.getBase64();
  const imageSource = base64 ? `data:image/jpeg;base64,${base64}` : imageUri;

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
    if (loading) {
      loop.start();
      
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2000);

      analyzeFood();

      return () => {
        loop.stop();
        clearInterval(interval);
        imageStore.clear();
      };
    } else {
      return () => {
        imageStore.clear();
      };
    }
  }, [loading]);

  const analyzeFood = async () => {
    try {
      const token = await getToken();
      if (!base64) {
        throw new Error('Image data not found. Please try scanning again.');
      }
      const data = await scanFood(token, base64, hint || undefined);
      setResult(data.result);
      if (data.imageUrl) {
        setCloudImageUrl(data.imageUrl);
      }
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
        imageUrl: cloudImageUrl || imageUri || null,
        calories: Math.round(result.calories * quantity),
        protein: Math.round(result.protein * quantity * 10) / 10,
        carbs: Math.round(result.carbs * quantity * 10) / 10,
        fat: Math.round(result.fat * quantity * 10) / 10,
        fiber: result.fiber ? Math.round(result.fiber * quantity * 10) / 10 : null,
        sugar: result.sugar ? Math.round(result.sugar * quantity * 10) / 10 : null,
        sodium: result.sodium ? Math.round(result.sodium * quantity * 10) / 10 : null,
        potassium: result.potassium ? Math.round(result.potassium * quantity * 10) / 10 : null,
        calcium: result.calcium ? Math.round(result.calcium * quantity * 10) / 10 : null,
        iron: result.iron ? Math.round(result.iron * quantity * 10) / 10 : null,
        vitaminC: result.vitaminC ? Math.round(result.vitaminC * quantity * 10) / 10 : null,
        vitaminD: result.vitaminD ? Math.round(result.vitaminD * quantity * 10) / 10 : null,
        serving: `${quantity} × ${result.serving}`,
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
    outputRange: [0, height * 0.4],
  });

  const adjustedCals = result ? Math.round(result.calories * quantity) : 0;
  const adjustedProtein = result ? Math.round(result.protein * quantity * 10) / 10 : 0;
  const adjustedCarbs = result ? Math.round(result.carbs * quantity * 10) / 10 : 0;
  const adjustedFat = result ? Math.round(result.fat * quantity * 10) / 10 : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Image Header */}
      <View style={styles.imageBackgroundContainer}>
        <Image
          source={{ uri: imageSource }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.scanOverlay} />
        )}
      </View>

      {/* Analyzing state / Skeleton Loader */}
      {loading && !error && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        >
          <View style={styles.sheetContainer}>
            <View style={[styles.skeleton, { width: 100, height: 28, borderRadius: 8, marginBottom: 16 }]} />
            <View style={[styles.skeleton, { width: 200, height: 32, borderRadius: 8, marginBottom: 24 }]} />
            
            <View style={styles.macroGrid}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={[styles.skeleton, styles.macroGridCard, { height: 72 }]} />
              ))}
            </View>

            <View style={[styles.skeleton, { width: 150, height: 24, borderRadius: 8, marginBottom: 16 }]} />
            <View style={[styles.skeleton, { width: '100%', height: 200, borderRadius: 20 }]} />
          </View>
        </ScrollView>
      )}

      {/* Floating Pill at Bottom of Screen */}
      {loading && !error && (
        <View style={styles.floatingPillContainer} pointerEvents="none">
          <View style={styles.loadingPill}>
            <Text style={styles.loadingPillText}>{LOADING_STEPS[loadingStep]}</Text>
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

      {/* Result state (matches food-detail.tsx UI) */}
      {result && !loading && (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sheetContainer}>
              <View style={styles.titleSection}>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={styles.foodName}>{result.name}</Text>
                  <Text style={styles.foodServing}>{result.serving}</Text>
                </View>

                <View style={styles.quantityStepper}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => {
                      const next = Math.max(0.1, quantity - 1);
                      setQuantityStr(String(Math.round(next * 10) / 10));
                    }}
                  >
                    <Minus size={18} color="#111" strokeWidth={2.5} />
                  </TouchableOpacity>
                  
                  <TextInput
                    style={styles.quantityInput}
                    value={quantityStr}
                    onChangeText={setQuantityStr}
                    keyboardType="numeric"
                    selectTextOnFocus
                  />

                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => {
                      const next = quantity + 1;
                      setQuantityStr(String(Math.round(next * 10) / 10));
                    }}
                  >
                    <Plus size={18} color="#111" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Macros Grid */}
              <View style={styles.macroGrid}>
                {/* Calories */}
                <View style={styles.macroGridCard}>
                  <View style={[styles.macroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
                    <Image source={require('../../../assets/onboarding/burnfat.svg')} style={styles.macroGridIcon} contentFit="contain" />
                  </View>
                  <View style={styles.macroGridText}>
                    <Text style={styles.macroGridLabel}>Calories</Text>
                    <Text style={styles.macroGridValue}>{adjustedCals}</Text>
                  </View>
                </View>

                {/* Carbs */}
                <View style={styles.macroGridCard}>
                  <View style={[styles.macroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
                    <Image source={require('../../../assets/onboarding/bread.svg')} style={styles.macroGridIcon} contentFit="contain" />
                  </View>
                  <View style={styles.macroGridText}>
                    <Text style={styles.macroGridLabel}>Carbs</Text>
                    <Text style={styles.macroGridValue}>{adjustedCarbs}g</Text>
                  </View>
                </View>

                {/* Protein */}
                <View style={styles.macroGridCard}>
                  <View style={[styles.macroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
                    <Image source={require('../../../assets/onboarding/chicken.svg')} style={styles.macroGridIcon} contentFit="contain" />
                  </View>
                  <View style={styles.macroGridText}>
                    <Text style={styles.macroGridLabel}>Protein</Text>
                    <Text style={styles.macroGridValue}>{adjustedProtein}g</Text>
                  </View>
                </View>

                {/* Fats */}
                <View style={styles.macroGridCard}>
                  <View style={[styles.macroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
                    <Image source={require('../../../assets/onboarding/fats.svg')} style={styles.macroGridIcon} contentFit="contain" />
                  </View>
                  <View style={styles.macroGridText}>
                    <Text style={styles.macroGridLabel}>Fats</Text>
                    <Text style={styles.macroGridValue}>{adjustedFat}g</Text>
                  </View>
                </View>
              </View>

              {/* Micronutrients */}
              <View style={styles.microSection}>
                <Text style={styles.sectionTitle}>Micronutrients</Text>
                <View style={styles.microList}>
                  <View style={styles.microRow}>
                    <Text style={styles.microLabel}>Fiber</Text>
                    <Text style={styles.microValue}>{result.fiber !== null ? `${Math.round(result.fiber * quantity * 10)/10}g` : '—'}</Text>
                  </View>
                  <View style={styles.microRow}>
                    <Text style={styles.microLabel}>Sugar</Text>
                    <Text style={styles.microValue}>{result.sugar !== null ? `${Math.round(result.sugar * quantity * 10)/10}g` : '—'}</Text>
                  </View>
                  <View style={styles.microRow}>
                    <Text style={styles.microLabel}>Sodium</Text>
                    <Text style={styles.microValue}>{result.sodium !== null ? `${Math.round(result.sodium * quantity * 10)/10}mg` : '—'}</Text>
                  </View>
                  <View style={styles.microRow}>
                    <Text style={styles.microLabel}>Potassium</Text>
                    <Text style={styles.microValue}>{result.potassium !== null ? `${Math.round(result.potassium * quantity * 10)/10}mg` : '—'}</Text>
                  </View>
                  <View style={styles.microRow}>
                    <Text style={styles.microLabel}>Calcium</Text>
                    <Text style={styles.microValue}>{result.calcium !== null ? `${Math.round(result.calcium * quantity * 10)/10}mg` : '—'}</Text>
                  </View>
                  <View style={styles.microRow}>
                    <Text style={styles.microLabel}>Iron</Text>
                    <Text style={styles.microValue}>{result.iron !== null ? `${Math.round(result.iron * quantity * 10)/10}mg` : '—'}</Text>
                  </View>
                </View>
              </View>

            </View>
          </ScrollView>

          {/* Bottom Floating Menu Bar */}
          <View style={styles.bottomBarWrapper} pointerEvents="box-none">
            <BlurView intensity={70} tint="light" style={styles.bottomBar}>
              {/* Left: Meal Selector */}
              <TouchableOpacity
                style={styles.mealDropdownBtn}
                onPress={() => setShowMealModal(true)}
              >
                <Text style={styles.mealDropdownText}>{selectedMeal}</Text>
              </TouchableOpacity>

              {/* Right: Log Food Button */}
              <TouchableOpacity
                style={[styles.bottomLogBtn, isLogging && { opacity: 0.6 }]}
                onPress={handleLogFood}
                disabled={isLogging}
                activeOpacity={0.7}
              >
                {isLogging ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.bottomLogBtnText}>Log Food</Text>
                )}
              </TouchableOpacity>
            </BlurView>
          </View>

          {/* Meal Picker Modal */}
          <Modal visible={showMealModal} transparent={true} animationType="fade">
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowMealModal(false)}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Meal</Text>
                {MEAL_OPTIONS.map((meal) => (
                  <TouchableOpacity
                    key={meal}
                    style={[styles.mealOptionBtn, selectedMeal === meal && styles.mealOptionBtnActive]}
                    onPress={() => {
                      setSelectedMeal(meal);
                      setShowMealModal(false);
                    }}
                  >
                    <Text style={[styles.mealOptionText, selectedMeal === meal && styles.mealOptionTextActive]}>{meal}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  imageBackgroundContainer: {
    height: height * 0.45,
    width: '100%',
    backgroundColor: '#E5E7EB',
  },
  topBar: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  floatingPillContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingPill: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  loadingPillText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skeleton: {
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollView: {
    flex: 1,
    marginTop: -32, // Pull sheet up over image
  },
  scrollContent: {
    paddingBottom: 100,
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    minHeight: height * 0.6,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  foodName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.5,
  },
  foodServing: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 6,
    fontWeight: '500',
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 100,
    paddingHorizontal: 6,
    paddingVertical: 6,
    flexShrink: 0,
  },
  quantityInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginHorizontal: 8,
    minWidth: 28,
    textAlign: 'center',
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  macroGridCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
  },
  macroIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  macroGridIcon: {
    width: 20,
    height: 20,
  },
  macroGridText: {
    flex: 1,
  },
  macroGridLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  macroGridValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginTop: 2,
  },
  microSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },
  microList: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 20,
  },
  microRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  microLabel: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
  },
  microValue: {
    fontSize: 15,
    color: '#111',
    fontWeight: '700',
  },
  bottomBarWrapper: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
  },
  mealDropdownBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mealDropdownText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  bottomLogBtn: {
    backgroundColor: '#1C1C1E',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomLogBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '80%',
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 20,
  },
  mealOptionBtn: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  mealOptionBtnActive: {
    backgroundColor: '#F9FAFB',
  },
  mealOptionText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '600',
  },
  mealOptionTextActive: {
    color: '#A3E635',
    fontWeight: '700',
  },
});

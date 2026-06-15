import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { ArrowLeft, Minus, Plus, Check } from 'lucide-react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { logFood, getFoodDetail } from '../../lib/api';

export default function FoodDetailScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const params = useLocalSearchParams<{
    foodId: string;
    foodName: string;
    serving: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  }>();

  const calories = parseInt(params.calories || '0');
  const protein = parseFloat(params.protein || '0');
  const carbs = parseFloat(params.carbs || '0');
  const fat = parseFloat(params.fat || '0');

  const [quantityStr, setQuantityStr] = useState('1');
  const quantity = parseFloat(quantityStr) || 0;
  
  const [isLogging, setIsLogging] = useState(false);
  const [detailLoading, setDetailLoading] = useState(true);
  const [foodDetail, setFoodDetail] = useState<any>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = await getToken();
        const detail = await getFoodDetail(token, params.foodId);
        setFoodDetail(detail);
      } catch (err) {
        console.log('Error fetching detail', err);
      } finally {
        setDetailLoading(false);
      }
    };
    fetchDetail();
  }, [params.foodId]);

  const adjustedCals = Math.round(calories * quantity);
  const adjustedProtein = Math.round(protein * quantity * 10) / 10;
  const adjustedCarbs = Math.round(carbs * quantity * 10) / 10;
  const adjustedFat = Math.round(fat * quantity * 10) / 10;

  let fiber = 0, sugar = 0, sodium = 0, potassium = 0, calcium = 0, iron = 0;
  if (foodDetail && foodDetail.servings && foodDetail.servings.length > 0) {
    const s = foodDetail.servings[0];
    fiber = Math.round((s.fiber || 0) * quantity * 10) / 10;
    sugar = Math.round((s.sugar || 0) * quantity * 10) / 10;
    sodium = Math.round((s.sodium || 0) * quantity * 10) / 10;
    potassium = Math.round((s.potassium || 0) * quantity * 10) / 10;
    calcium = Math.round((s.calcium || 0) * quantity * 10) / 10;
    iron = Math.round((s.iron || 0) * quantity * 10) / 10;
  }

  const handleLogFood = async () => {
    setIsLogging(true);
    try {
      const token = await getToken();
      await logFood(token, {
        foodId: params.foodId,
        name: params.foodName,
        calories: adjustedCals,
        protein: adjustedProtein,
        carbs: adjustedCarbs,
        fat: adjustedFat,
        serving: `${quantity} × ${params.serving}`,
        mealType: 'Lunch', // Defaulted or you could re-add meal selector if desired
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

  const MicroRow = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.microRow}>
      <Text style={styles.microLabel}>{label}</Text>
      <Text style={styles.microValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111" strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logBtnTopRight, isLogging && { opacity: 0.6 }]}
          onPress={handleLogFood}
          disabled={isLogging}
          activeOpacity={0.7}
        >
          {isLogging ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <>
              <Check size={18} color="#000" strokeWidth={3} />
              <Text style={styles.logBtnText}>Log Food</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Quantity */}
        <View style={styles.titleSection}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={styles.foodName}>{params.foodName}</Text>
            <Text style={styles.foodServing}>{params.serving}</Text>
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
          {detailLoading ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator color="#A3E635" />
            </View>
          ) : (
            <View style={styles.microList}>
              <MicroRow label="Fiber" value={`${fiber}g`} />
              <MicroRow label="Sugar" value={`${sugar}g`} />
              <MicroRow label="Sodium" value={`${sodium}mg`} />
              <MicroRow label="Potassium" value={`${potassium}mg`} />
              <MicroRow label="Calcium" value={`${calcium}mg`} />
              <MicroRow label="Iron" value={`${iron}mg`} />
            </View>
          )}
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logBtnTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A3E635',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    gap: 8,
  },
  logBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  foodName: {
    fontSize: 28,
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
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
  },
  macroIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  macroGridIcon: {
    width: 24,
    height: 24,
  },
  macroGridText: {
    flex: 1,
  },
  macroGridLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  macroGridValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginTop: 2,
  },
  macroGridUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
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
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 100,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginHorizontal: 8,
    minWidth: 28,
    textAlign: 'center',
  },
  logBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});

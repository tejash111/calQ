import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { ArrowLeft, X } from 'lucide-react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { logFood } from '../../lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

const MEAL_OPTIONS = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

export default function CustomMealDetailScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const params = useLocalSearchParams<{ mealStr: string }>();

  const meal = params.mealStr ? JSON.parse(params.mealStr) : null;
  const items = meal?.items || [];

  const [isLogging, setIsLogging] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<string>('Lunch');

  if (!meal) {
    return (
      <View style={styles.container}>
        <Text>Error loading meal.</Text>
      </View>
    );
  }

  const handleLogMeal = async () => {
    setIsLogging(true);
    try {
      const token = await getToken();
      // Log each item in the custom meal individually
      await Promise.all(
        items.map((item: any, i: number) =>
          logFood(token, {
            foodId: `${item.id}-${i}`,
            name: item.name,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            fiber: item.fiber || null,
            sugar: item.sugar || null,
            serving: item.serving,
            mealType: selectedMeal,
          })
        )
      );
      Alert.alert('Success', `Logged ${meal.name} for ${selectedMeal}!`);
      router.dismissAll();
      router.replace('/dashboard');
    } catch (err) {
      console.error('Log error:', err);
      Alert.alert('Error', 'Failed to log custom meal. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.mealName}>{meal.name}</Text>
          <Text style={styles.mealSub}>{items.length} items in this meal</Text>
        </View>

        {/* Macros Grid */}
        <View style={styles.macroGrid}>
          <View style={styles.macroGridCard}>
            <View style={[styles.macroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
              <Image source={require('../../../assets/onboarding/burnfat.svg')} style={styles.macroGridIcon} contentFit="contain" />
            </View>
            <View style={styles.macroGridText}>
              <Text style={styles.macroGridLabel}>Calories</Text>
              <Text style={styles.macroGridValue}>{meal.calories}</Text>
            </View>
          </View>

          <View style={styles.macroGridCard}>
            <View style={[styles.macroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
              <Image source={require('../../../assets/onboarding/bread.svg')} style={styles.macroGridIcon} contentFit="contain" />
            </View>
            <View style={styles.macroGridText}>
              <Text style={styles.macroGridLabel}>Carbs</Text>
              <Text style={styles.macroGridValue}>{meal.carbs}g</Text>
            </View>
          </View>

          <View style={styles.macroGridCard}>
            <View style={[styles.macroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
              <Image source={require('../../../assets/onboarding/chicken.svg')} style={styles.macroGridIcon} contentFit="contain" />
            </View>
            <View style={styles.macroGridText}>
              <Text style={styles.macroGridLabel}>Protein</Text>
              <Text style={styles.macroGridValue}>{meal.protein}g</Text>
            </View>
          </View>

          <View style={styles.macroGridCard}>
            <View style={[styles.macroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
              <Image source={require('../../../assets/onboarding/fats.svg')} style={styles.macroGridIcon} contentFit="contain" />
            </View>
            <View style={styles.macroGridText}>
              <Text style={styles.macroGridLabel}>Fats</Text>
              <Text style={styles.macroGridValue}>{meal.fat}g</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Items</Text>
        
        {items.map((item: any, index: number) => (
          <View key={`${item.id}-${index}`} style={styles.individualCard}>
            <View style={styles.individualCardHeader}>
              <Text style={styles.individualCardName} numberOfLines={1}>{item.name}</Text>
            </View>
            <Text style={styles.servingText}>{item.serving}</Text>

            <View style={styles.compactMacroRow}>
              <View style={styles.compactMacroCard}>
                <View style={[styles.compactMacroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
                  <Image source={require('../../../assets/onboarding/burnfat.svg')} style={styles.compactMacroGridIcon} contentFit="contain" />
                </View>
                <View style={styles.compactMacroGridText}>
                  <Text style={styles.compactMacroLabel}>Cals</Text>
                  <Text style={styles.compactMacroValue}>{Math.round(item.calories)}</Text>
                </View>
              </View>
              <View style={styles.compactMacroCard}>
                <View style={[styles.compactMacroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
                  <Image source={require('../../../assets/onboarding/bread.svg')} style={styles.compactMacroGridIcon} contentFit="contain" />
                </View>
                <View style={styles.compactMacroGridText}>
                  <Text style={styles.compactMacroLabel}>Carbs</Text>
                  <Text style={styles.compactMacroValue}>{Math.round(item.carbs * 10) / 10}g</Text>
                </View>
              </View>
              <View style={styles.compactMacroCard}>
                <View style={[styles.compactMacroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
                  <Image source={require('../../../assets/onboarding/chicken.svg')} style={styles.compactMacroGridIcon} contentFit="contain" />
                </View>
                <View style={styles.compactMacroGridText}>
                  <Text style={styles.compactMacroLabel}>Prot</Text>
                  <Text style={styles.compactMacroValue}>{Math.round(item.protein * 10) / 10}g</Text>
                </View>
              </View>
              <View style={styles.compactMacroCard}>
                <View style={[styles.compactMacroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
                  <Image source={require('../../../assets/onboarding/fats.svg')} style={styles.compactMacroGridIcon} contentFit="contain" />
                </View>
                <View style={styles.compactMacroGridText}>
                  <Text style={styles.compactMacroLabel}>Fats</Text>
                  <Text style={styles.compactMacroValue}>{Math.round(item.fat * 10) / 10}g</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Floating Menu Bar */}
      <View style={styles.bottomBarWrapper} pointerEvents="box-none">
        <BlurView intensity={70} tint="light" style={styles.bottomBar}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <TouchableOpacity style={styles.mealDropdownBtn}>
                <Text style={styles.mealDropdownText}>{selectedMeal}</Text>
              </TouchableOpacity>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" overlayClassName="bg-black/20" className="w-48 bg-white rounded-2xl border border-gray-200 shadow-md p-1.5" style={{ minWidth: 170 }}>
              {MEAL_OPTIONS.map((m) => (
                <DropdownMenuItem key={m} onPress={() => setSelectedMeal(m)} className={`rounded-xl px-4 py-4 mb-0.5 active:bg-gray-100 ${selectedMeal === m ? 'bg-gray-100' : ''}`}>
                  <Text className="text-black font-normal text-[18px]">{m}</Text>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <TouchableOpacity
            style={[styles.bottomLogBtn, isLogging && { opacity: 0.6 }]}
            onPress={handleLogMeal}
            disabled={isLogging}
            activeOpacity={0.7}
          >
            {isLogging ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.bottomLogBtnText}>Log Meal</Text>
            )}
          </TouchableOpacity>
        </BlurView>
      </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  titleSection: {
    marginBottom: 24,
  },
  mealName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.5,
  },
  mealSub: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },
  individualCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  individualCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  individualCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    flex: 1,
  },
  servingText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  compactMacroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compactMacroCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 6,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  compactMacroIconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    backgroundColor: '#F3F4F6',
  },
  compactMacroGridIcon: {
    width: 11,
    height: 11,
  },
  compactMacroGridText: {
    flex: 1,
  },
  compactMacroLabel: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '600',
  },
  compactMacroValue: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111',
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
});

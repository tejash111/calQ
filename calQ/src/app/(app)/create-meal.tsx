import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { ArrowLeft, Plus, X } from 'lucide-react-native';
import { Image } from 'expo-image';
import { saveCustomMeal } from '../../lib/api';
import { MealDraftState, DraftFoodItem } from '../../lib/MealDraftState';

export default function CreateMealScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  
  const [mealName, setMealName] = useState('');
  const [items, setItems] = useState<DraftFoodItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Sync initial state
    setItems(MealDraftState.getItems());
    
    // Subscribe to changes
    const unsubscribe = MealDraftState.subscribe((newItems) => {
      setItems(newItems);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const totals = items.reduce((acc, item) => {
    acc.calories += item.calories;
    acc.protein += item.protein;
    acc.carbs += item.carbs;
    acc.fat += item.fat;
    acc.fiber += item.fiber || 0;
    acc.sugar += item.sugar || 0;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 });

  const handleSave = async () => {
    if (!mealName.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for your meal.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Empty Meal', 'Please add at least one food item.');
      return;
    }

    setIsSaving(true);
    try {
      const token = await getToken();
      await saveCustomMeal(token, {
        name: mealName.trim(),
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
        fiber: Math.round(totals.fiber * 10) / 10,
        sugar: Math.round(totals.sugar * 10) / 10,
        items
      });
      MealDraftState.clear();
      router.back();
    } catch (err) {
      console.error('Save meal error:', err);
      Alert.alert('Error', 'Failed to save meal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (items.length > 0 || mealName.trim()) {
      Alert.alert('Discard Meal?', 'You have unsaved changes. Are you sure you want to go back?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => {
          MealDraftState.clear();
          router.back();
        }}
      ]);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <ArrowLeft size={24} color="#111" strokeWidth={2.5} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.saveBtn, (!mealName.trim() || items.length === 0) && styles.saveBtnDisabled]} 
          onPress={handleSave}
          disabled={!mealName.trim() || items.length === 0 || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TextInput
          style={styles.nameInput}
          placeholder="Meal Name"
          placeholderTextColor="#9CA3AF"
          value={mealName}
          onChangeText={setMealName}
        />

        {/* Combined Totals Card */}
        <View style={styles.foodCard}>
          <View style={styles.foodCardHeader}>
            <Text style={styles.foodCardName}>Combined Totals</Text>
          </View>

          <View style={styles.macroGrid}>
            <View style={styles.macroGridCard}>
              <View style={[styles.macroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
                <Image source={require('../../../assets/onboarding/burnfat.svg')} style={styles.macroGridIcon} contentFit="contain" />
              </View>
              <View style={styles.macroGridText}>
                <Text style={styles.macroGridLabel}>Calories</Text>
                <Text style={styles.macroGridValue}>{Math.round(totals.calories)}</Text>
              </View>
            </View>

            <View style={styles.macroGridCard}>
              <View style={[styles.macroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
                <Image source={require('../../../assets/onboarding/bread.svg')} style={styles.macroGridIcon} contentFit="contain" />
              </View>
              <View style={styles.macroGridText}>
                <Text style={styles.macroGridLabel}>Carbs</Text>
                <Text style={styles.macroGridValue}>{Math.round(totals.carbs * 10) / 10}g</Text>
              </View>
            </View>

            <View style={styles.macroGridCard}>
              <View style={[styles.macroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
                <Image source={require('../../../assets/onboarding/chicken.svg')} style={styles.macroGridIcon} contentFit="contain" />
              </View>
              <View style={styles.macroGridText}>
                <Text style={styles.macroGridLabel}>Protein</Text>
                <Text style={styles.macroGridValue}>{Math.round(totals.protein * 10) / 10}g</Text>
              </View>
            </View>

            <View style={styles.macroGridCard}>
              <View style={[styles.macroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
                <Image source={require('../../../assets/onboarding/fats.svg')} style={styles.macroGridIcon} contentFit="contain" />
              </View>
              <View style={styles.macroGridText}>
                <Text style={styles.macroGridLabel}>Fats</Text>
                <Text style={styles.macroGridValue}>{Math.round(totals.fat * 10) / 10}g</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Individual Items */}
        <Text style={styles.sectionTitle}>Food Items</Text>
        
        {items.length === 0 ? (
          <View style={styles.emptyItems}>
            <Text style={styles.emptyItemsText}>No items added yet</Text>
          </View>
        ) : (
          items.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.individualCard}>
              <View style={styles.individualCardHeader}>
                <Text style={styles.individualCardName} numberOfLines={1}>{item.name}</Text>
                <TouchableOpacity style={styles.removeBtn} onPress={() => MealDraftState.removeItem(index)}>
                  <X size={16} color="#9CA3AF" strokeWidth={2.5} />
                </TouchableOpacity>
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
          ))
        )}

        <TouchableOpacity 
          style={styles.addFoodBtn}
          onPress={() => router.push({ pathname: '/(app)/food-database', params: { selectionMode: 'true' } })}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 8 }} />
          <Text style={styles.addFoodBtnText}>Add Food</Text>
        </TouchableOpacity>

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
  saveBtn: {
    backgroundColor: '#111',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
  },
  saveBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nameInput: {
    fontSize: 16,
    fontWeight: '400',
    color: '#111',
    marginBottom: 24,
    paddingVertical: 12,
  },
  foodCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  foodCardHeader: {
    marginBottom: 14,
  },
  foodCardName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  macroGridCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    marginBottom: 8,
  },
  macroIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#F3F4F6',
  },
  macroGridIcon: {
    width: 20,
    height: 20,
  },
  macroGridText: {
    flex: 1,
  },
  macroGridLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  macroGridValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  emptyItems: {
    paddingVertical: 30,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  emptyItemsText: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '500',
  },
  addFoodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  addFoodBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  individualCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  individualCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingRight: 24,
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
  removeBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    padding: 8,
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
});

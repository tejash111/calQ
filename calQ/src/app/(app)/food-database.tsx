import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { ArrowLeft, Search, Plus, ChefHat } from 'lucide-react-native';
import { searchFood, logFood, getCustomMeals } from '../../lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

const { width } = Dimensions.get('window');

function useDebounce(callback: Function, delay: number) {
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

interface FoodResult {
  id: string;
  name: string;
  description: string;
  url: string;
  type: string;
}

export default function FoodDatabaseScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const params = useLocalSearchParams<{ selectionMode?: string }>();
  const isSelectionMode = params.selectionMode === 'true';
  
  const [activeTab, setActiveTab] = useState<'search' | 'mymeals'>('search');
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [loggingFoodId, setLoggingFoodId] = useState<string | null>(null);

  const [customMeals, setCustomMeals] = useState<any[]>([]);
  const [mealsLoading, setMealsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'mymeals') {
      fetchCustomMeals();
    }
  }, [activeTab]);

  const fetchCustomMeals = async () => {
    setMealsLoading(true);
    try {
      const token = await getToken();
      const data = await getCustomMeals(token);
      setCustomMeals(data.meals || []);
    } catch (err) {
      console.error('Error fetching custom meals', err);
    } finally {
      setMealsLoading(false);
    }
  };

  const fetchResults = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      const response = await searchFood(token, searchQuery);
      setResults(response.results || []);
    } catch (err: any) {
      console.error('Search error:', err);
      let errorMessage = 'Failed to fetch food results';
      if (err.message && err.message.includes('Invalid IP address')) {
        errorMessage = 'Your FatSecret API key is restricted by IP. Please update the IP whitelist in your FatSecret Developer Dashboard.';
      } else if (err.message) {
        try {
          const match = err.message.match(/({.*})/);
          if (match) {
            const parsed = JSON.parse(match[1]);
            if (parsed.error && typeof parsed.error === 'object' && parsed.error.message) {
              errorMessage = parsed.error.message;
            } else if (parsed.error) {
              errorMessage = String(parsed.error);
            }
          } else {
             errorMessage = err.message.replace('API error 400: ', '').replace('API error 500: ', '');
          }
        } catch {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useDebounce(fetchResults, 500);

  const handleSearchChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const handleQuickLog = async (item: FoodResult, mealType: string) => {
    setLoggingFoodId(item.id);
    try {
      const token = await getToken();
      const macros = parseMacros(item.description);
      await logFood(token, {
        foodId: item.id,
        name: item.name,
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        serving: macros.serving,
        mealType,
      });
      alert(`Successfully logged ${item.name} for ${mealType}!`);
      setActiveDropdownId(null);
    } catch (err) {
      console.error('Failed to log food:', err);
      alert('Failed to log food. Please try again.');
    } finally {
      setLoggingFoodId(null);
    }
  };

  const parseMacros = (desc: string) => {
    const parts = desc.split(' - ');
    const serving = parts[0] || '';
    let calories = 0, protein = 0, carbs = 0, fat = 0;
    
    if (parts[1]) {
      const macroParts = parts[1].split(' | ');
      macroParts.forEach(p => {
        if (p.includes('Calories:')) calories = parseInt(p.replace('Calories:', '').replace('kcal', '').trim()) || 0;
        if (p.includes('Protein:')) protein = parseFloat(p.replace('Protein:', '').replace('g', '').trim()) || 0;
        if (p.includes('Carbs:')) carbs = parseFloat(p.replace('Carbs:', '').replace('g', '').trim()) || 0;
        if (p.includes('Fat:')) fat = parseFloat(p.replace('Fat:', '').replace('g', '').trim()) || 0;
      });
    }
    return { serving, calories, protein, carbs, fat };
  };

  const handleFoodPress = (item: FoodResult) => {
    const macros = parseMacros(item.description);
    router.push({
      pathname: '/(app)/food-detail',
      params: {
        foodId: item.id,
        foodName: item.name,
        serving: macros.serving,
        calories: String(macros.calories),
        protein: String(macros.protein),
        carbs: String(macros.carbs),
        fat: String(macros.fat),
        selectionMode: isSelectionMode ? 'true' : 'false',
      },
    });
  };

  const handleCustomMealPress = (meal: any) => {
    router.push({
      pathname: '/(app)/custom-meal-detail',
      params: {
        mealStr: JSON.stringify(meal)
      }
    });
  };

  const renderItem = ({ item }: { item: FoodResult }) => {
    const { serving, calories } = parseMacros(item.description);
    const isLoggingThis = loggingFoodId === item.id;

    return (
      <View style={styles.foodItemContainer}>
        <TouchableOpacity
          style={styles.foodItem}
          onPress={() => handleFoodPress(item)}
          activeOpacity={0.6}
        >
          <View style={styles.foodItemContent}>
            <Text style={styles.foodItemName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.foodItemMeta}>
              <Text style={styles.foodItemServing}>{serving}</Text>
              {calories > 0 && (
                <>
                  <Text style={styles.foodItemDot}>•</Text>
                  <Text style={styles.foodItemCalories}>{calories} kcal</Text>
                </>
              )}
            </View>
          </View>
          {!isSelectionMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <TouchableOpacity 
                  style={styles.addBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Plus size={18} color="#111" strokeWidth={2.5} />
                </TouchableOpacity>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="center" overlayClassName="bg-black/20" style={{ width: 190, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#E5E7EB', padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 }}>
                {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal) => (
                  <DropdownMenuItem key={meal} onPress={() => handleQuickLog(item, meal)} disabled={isLoggingThis} style={{ paddingHorizontal: 12, paddingVertical: 12, marginVertical: 2, borderRadius: 16 }}>
                    <Text style={{ color: '#111', fontSize: 16, fontWeight: '500' }}>{meal}</Text>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderCustomMeal = ({ item }: { item: any }) => {
    return (
      <View style={styles.foodItemContainer}>
        <TouchableOpacity
          style={styles.foodItem}
          onPress={() => handleCustomMealPress(item)}
          activeOpacity={0.6}
        >
          <View style={[styles.addBtn, { marginRight: 12, backgroundColor: '#A3E635' }]}>
            <ChefHat size={18} color="#000" strokeWidth={2} />
          </View>
          <View style={styles.foodItemContent}>
            <Text style={styles.foodItemName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.foodItemMeta}>
              <Text style={styles.foodItemCalories}>{item.calories} kcal</Text>
              <Text style={styles.foodItemDot}>•</Text>
              <Text style={styles.foodItemServing}>{item.protein}g Protein</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {!isSelectionMode ? (
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'search' && styles.tabBtnActive]} 
              onPress={() => setActiveTab('search')}
            >
              <Text style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'mymeals' && styles.tabBtnActive]} 
              onPress={() => setActiveTab('mymeals')}
            >
              <Text style={[styles.tabText, activeTab === 'mymeals' && styles.tabTextActive]}>My Meals</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.pageTitle}>Add to Meal</Text>
        )}

        {activeTab === 'search' || isSelectionMode ? (
          <>
            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Search size={20} color="#9CA3AF" />
              <TextInput
                value={query}
                onChangeText={handleSearchChange}
                placeholder="Search for a food..."
                placeholderTextColor="#9CA3AF"
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
            </View>

            {/* Results */}
            {isLoading && query.length >= 3 && results.length === 0 ? (
              <View style={styles.centerState}>
                <ActivityIndicator size="large" color="#A3E635" />
              </View>
            ) : error ? (
              <View style={styles.centerState}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : query.length >= 3 && results.length === 0 ? (
              <View style={styles.centerState}>
                <Text style={styles.emptyText}>No foods found</Text>
              </View>
            ) : query.length < 3 ? (
              <View style={styles.centerState}>
                <Text style={styles.hintEmoji}>🔍</Text>
                <Text style={styles.hintText}>Type at least 3 characters to search</Text>
              </View>
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.createMealBtn}
              onPress={() => router.push('/(app)/create-meal')}
            >
              <Plus size={20} color="#fff" strokeWidth={2.5} style={{ marginRight: 8 }} />
              <Text style={styles.createMealBtnText}>Create New Meal</Text>
            </TouchableOpacity>
            
            {mealsLoading ? (
              <View style={styles.centerState}>
                <ActivityIndicator size="large" color="#A3E635" />
              </View>
            ) : customMeals.length === 0 ? (
              <View style={styles.centerState}>
                <Text style={styles.emptyText}>You haven't created any meals yet.</Text>
              </View>
            ) : (
              <FlatList
                data={customMeals}
                keyExtractor={(item) => item.id}
                renderItem={renderCustomMeal}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 16,
  },
  tabBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#111',
    fontWeight: '700',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 12,
    fontSize: 16,
    color: '#111',
    fontWeight: '500',
  },
  foodItemContainer: {
    marginBottom: 10,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  addBtn: {
    padding: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 24,
  },
  foodItemContent: {
    flex: 1,
    marginRight: 12,
  },
  foodItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
    marginBottom: 4,
  },
  foodItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodItemServing: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  foodItemDot: {
    fontSize: 13,
    color: '#D1D5DB',
    marginHorizontal: 6,
  },
  foodItemCalories: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  createMealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  createMealBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  centerState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 15,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  hintEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  hintText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

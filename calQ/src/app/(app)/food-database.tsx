import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { ArrowLeft, Search, Plus } from 'lucide-react-native';
import { searchFood, logFood } from '../../lib/api';

const { width } = Dimensions.get('window');

// Lodash debounce alternative
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
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [loggingFoodId, setLoggingFoodId] = useState<string | null>(null);

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
      },
    });
  };

  const renderItem = ({ item }: { item: FoodResult }) => {
    const { serving, calories } = parseMacros(item.description);
    const isDropdownOpen = activeDropdownId === item.id;
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
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => setActiveDropdownId(isDropdownOpen ? null : item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Plus size={18} color="#111" strokeWidth={2.5} />
          </TouchableOpacity>
        </TouchableOpacity>

        {isDropdownOpen && (
          <View style={styles.dropdownContainer}>
            {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal) => (
              <TouchableOpacity
                key={meal}
                style={styles.dropdownPill}
                onPress={() => handleQuickLog(item, meal)}
                disabled={isLoggingThis}
              >
                <Text style={styles.dropdownPillText}>{meal}</Text>
              </TouchableOpacity>
            ))}
            {isLoggingThis && <ActivityIndicator size="small" color="#A3E635" style={{ marginLeft: 8 }} />}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.inner}>
        {/* Header */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Search Food</Text>

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
  // Header
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
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  // Search
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
  // Food item
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
  // Dropdown
  dropdownContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  dropdownPill: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  dropdownPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  // States
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

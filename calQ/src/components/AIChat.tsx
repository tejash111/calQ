import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useAuth } from '@clerk/clerk-expo';
import { ArrowUp, Plus, Check, X } from 'lucide-react-native';
import { sendAIChat, logFood, type AIFoodAnalysisResponse, type AIFoodItem, type AIResponse } from '../lib/api';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  foodAnalysis?: AIFoodAnalysisResponse;
  loggedItems?: Set<number>; // indices of items that have been logged
  selectedMeals?: Record<number, string>; // per-item meal selection
}

const MEAL_OPTIONS = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

function SkeletonLoader() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <View style={styles.skeletonWrap}>
      <Animated.View style={[styles.skeletonLine, { width: '70%', opacity }]} />
      <Animated.View style={[styles.skeletonLine, { width: '90%', opacity }]} />
      <View style={styles.skeletonMacroRow}>
        {[1, 2, 3, 4].map((i) => (
          <Animated.View key={i} style={[styles.skeletonMacroCard, { opacity }]} />
        ))}
      </View>
      <Animated.View style={[styles.skeletonLine, { width: '50%', marginTop: 12, opacity }]} />
    </View>
  );
}

// ─── Food Card (matches food-detail page UI) ─────────────────────────────────

interface CombinedTotalsCardProps {
  foodAnalysis: AIFoodAnalysisResponse;
  msgId: string;
  selectedMeal: string;
  onMealChange: (meal: string) => void;
  onLog: () => void;
  isLogging: boolean;
  isLogged: boolean;
}

function IndividualFoodCard({
  item,
  onRemove,
}: {
  item: AIFoodItem;
  onRemove: () => void;
}) {
  const itemTitle = item.quantity.includes('(')
    ? `${item.name}, ${item.quantity}`
    : `${item.name} (${item.quantity})`;

  return (
    <View style={styles.individualCard}>
      {/* Header section with Name and Close button */}
      <View style={styles.individualCardHeader}>
        <Text style={styles.individualCardName}>{itemTitle}</Text>
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove} activeOpacity={0.6}>
          <X size={16} color="#9CA3AF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Macro Row (similar to combined card's grid, but single row, compact) */}
      <View style={styles.compactMacroRow}>
        <View style={styles.compactMacroCard}>
          <View style={[styles.compactMacroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
            <Image source={require('../../assets/onboarding/burnfat.svg')} style={styles.compactMacroGridIcon} contentFit="contain" />
          </View>
          <View style={styles.compactMacroGridText}>
            <Text style={styles.compactMacroLabel}>Cals</Text>
            <Text style={styles.compactMacroValue}>{Math.round(item.calories)}</Text>
          </View>
        </View>

        <View style={styles.compactMacroCard}>
          <View style={[styles.compactMacroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
            <Image source={require('../../assets/onboarding/bread.svg')} style={styles.compactMacroGridIcon} contentFit="contain" />
          </View>
          <View style={styles.compactMacroGridText}>
            <Text style={styles.compactMacroLabel}>Carbs</Text>
            <Text style={styles.compactMacroValue}>{Math.round(item.carbs * 10) / 10}g</Text>
          </View>
        </View>

        <View style={styles.compactMacroCard}>
          <View style={[styles.compactMacroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
            <Image source={require('../../assets/onboarding/chicken.svg')} style={styles.compactMacroGridIcon} contentFit="contain" />
          </View>
          <View style={styles.compactMacroGridText}>
            <Text style={styles.compactMacroLabel}>Prot</Text>
            <Text style={styles.compactMacroValue}>{Math.round(item.protein * 10) / 10}g</Text>
          </View>
        </View>

        <View style={styles.compactMacroCard}>
          <View style={[styles.compactMacroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
            <Image source={require('../../assets/onboarding/fats.svg')} style={styles.compactMacroGridIcon} contentFit="contain" />
          </View>
          <View style={styles.compactMacroGridText}>
            <Text style={styles.compactMacroLabel}>Fats</Text>
            <Text style={styles.compactMacroValue}>{Math.round(item.fat * 10) / 10}g</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function CombinedTotalsCard({
  foodAnalysis,
  selectedMeal,
  onMealChange,
  onLog,
  isLogging,
  isLogged,
}: CombinedTotalsCardProps) {
  const [showMealPicker, setShowMealPicker] = useState(false);

  return (
    <View style={styles.foodCard}>
      {/* Header */}
      <View style={styles.foodCardHeader}>
        <Text style={styles.foodCardName}>Combined Totals</Text>
      </View>

      {/* Macro Grid */}
      <View style={styles.macroGrid}>
        <View style={styles.macroGridCard}>
          <View style={[styles.macroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
            <Image source={require('../../assets/onboarding/burnfat.svg')} style={styles.macroGridIcon} contentFit="contain" />
          </View>
          <View style={styles.macroGridText}>
            <Text style={styles.macroGridLabel}>Calories</Text>
            <Text style={styles.macroGridValue}>{Math.round(foodAnalysis.totals.calories)}</Text>
          </View>
        </View>

        <View style={styles.macroGridCard}>
          <View style={[styles.macroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
            <Image source={require('../../assets/onboarding/bread.svg')} style={styles.macroGridIcon} contentFit="contain" />
          </View>
          <View style={styles.macroGridText}>
            <Text style={styles.macroGridLabel}>Carbs</Text>
            <Text style={styles.macroGridValue}>{Math.round(foodAnalysis.totals.carbs * 10) / 10}g</Text>
          </View>
        </View>

        <View style={styles.macroGridCard}>
          <View style={[styles.macroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
            <Image source={require('../../assets/onboarding/chicken.svg')} style={styles.macroGridIcon} contentFit="contain" />
          </View>
          <View style={styles.macroGridText}>
            <Text style={styles.macroGridLabel}>Protein</Text>
            <Text style={styles.macroGridValue}>{Math.round(foodAnalysis.totals.protein * 10) / 10}g</Text>
          </View>
        </View>

        <View style={styles.macroGridCard}>
          <View style={[styles.macroIconWrapper, { backgroundColor: '#FFFFFF' }]}>
            <Image source={require('../../assets/onboarding/fats.svg')} style={styles.macroGridIcon} contentFit="contain" />
          </View>
          <View style={styles.macroGridText}>
            <Text style={styles.macroGridLabel}>Fats</Text>
            <Text style={styles.macroGridValue}>{Math.round(foodAnalysis.totals.fat * 10) / 10}g</Text>
          </View>
        </View>
      </View>

      {/* Micronutrient profile */}
      <View style={styles.microSectionCombined}>
        <Text style={styles.microSectionTitleCombined}>Micronutrients</Text>
        <View style={styles.microListCombined}>
          <View style={styles.microRowCombined}>
            <Text style={styles.microLabelCombined}>Fiber</Text>
            <Text style={styles.microValueCombined}>
              {foodAnalysis.totals.fiber !== undefined ? `${Math.round(foodAnalysis.totals.fiber * 10) / 10}g` : '—'}
            </Text>
          </View>
          <View style={styles.microRowCombined}>
            <Text style={styles.microLabelCombined}>Sugar</Text>
            <Text style={styles.microValueCombined}>
              {foodAnalysis.totals.sugar !== undefined ? `${Math.round(foodAnalysis.totals.sugar * 10) / 10}g` : '—'}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom: Meal Selector & Log Button / Logged Banner */}
      {isLogged ? (
        <View style={styles.fullWidthLoggedBanner}>
          <Text style={styles.fullWidthLoggedText}>Food Logged</Text>
        </View>
      ) : (
        <View style={styles.foodCardFooter}>
          {/* Meal Selector */}
          {showMealPicker ? (
            <View style={styles.mealPickerRow}>
              {MEAL_OPTIONS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.mealChip, selectedMeal === m && styles.mealChipActive]}
                  onPress={() => {
                    onMealChange(m);
                    setShowMealPicker(false);
                  }}
                >
                  <Text style={[styles.mealChipText, selectedMeal === m && styles.mealChipTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TouchableOpacity style={styles.mealDropdown} onPress={() => setShowMealPicker(true)}>
              <Text style={styles.mealDropdownText}>{selectedMeal}</Text>
            </TouchableOpacity>
          )}

          {/* Log Button */}
          <TouchableOpacity
            style={[styles.logFoodBtn, isLogging && { opacity: 0.6 }]}
            onPress={onLog}
            disabled={isLogging}
            activeOpacity={0.7}
          >
            {isLogging ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.logFoodBtnText}>Log Food</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Main AI Chat Component ──────────────────────────────────────────────────

export default function AIChat() {
  const insets = useSafeAreaInsets();
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loggingStates, setLoggingStates] = useState<Record<string, boolean>>({});
  const [sessionId] = useState(() => uuidv4());
  const flatListRef = useRef<FlatList>(null);
  const [showTopFade, setShowTopFade] = useState(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    Keyboard.dismiss();
    setInputText('');

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    scrollToBottom();

    try {
      const token = await getToken();
      const result: AIResponse = await sendAIChat(token, text, sessionId);

      const assistantMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        text: result.type === 'chat' ? result.message : result.summary || 'Here\'s what I found:',
        foodAnalysis: result.type === 'food_analysis' ? result : undefined,
        loggedItems: new Set(),
        selectedMeals: {},
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        text: 'Sorry, I couldn\'t process that. Please try again.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [inputText, isLoading, sessionId, getToken, scrollToBottom]);

  const handleLogAll = useCallback(async (msgId: string, items: AIFoodItem[], mealType: string) => {
    setLoggingStates((prev) => ({ ...prev, [msgId]: true }));

    try {
      const token = await getToken();
      await Promise.all(
        items.map((item, i) =>
          logFood(token, {
            foodId: `ai-${Date.now()}-${i}`,
            name: item.name,
            calories: Math.round(item.calories),
            protein: Math.round(item.protein * 10) / 10,
            carbs: Math.round(item.carbs * 10) / 10,
            fat: Math.round(item.fat * 10) / 10,
            fiber: item.fiber || null,
            sugar: item.sugar || null,
            serving: item.quantity,
            mealType,
          })
        )
      );

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === msgId) {
            const newLogged = new Set<number>();
            items.forEach((_, idx) => newLogged.add(idx));
            return { ...msg, loggedItems: newLogged };
          }
          return msg;
        })
      );
    } catch (err) {
      console.error('Failed to log food:', err);
    } finally {
      setLoggingStates((prev) => ({ ...prev, [msgId]: false }));
    }
  }, [getToken]);

  const handleMealChangeAll = useCallback((msgId: string, meal: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId) {
          return {
            ...msg,
            selectedMeals: { 0: meal },
          };
        }
        return msg;
      })
    );
  }, []);

  const handleRemoveItem = useCallback((msgId: string, itemIndex: number) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId && msg.foodAnalysis) {
          const updatedItems = msg.foodAnalysis.items.filter((_, idx) => idx !== itemIndex);
          const newTotals = updatedItems.reduce(
            (acc, item) => {
              acc.calories += item.calories;
              acc.protein += item.protein;
              acc.carbs += item.carbs;
              acc.fat += item.fat;
              acc.fiber += item.fiber || 0;
              acc.sugar += item.sugar || 0;
              return acc;
            },
            { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
          );

          return {
            ...msg,
            foodAnalysis: {
              ...msg.foodAnalysis,
              items: updatedItems,
              totals: newTotals,
            },
            loggedItems: new Set(),
          };
        }
        return msg;
      })
    );
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowTopFade(offsetY > 30);
  }, []);

  const renderMessage = useCallback(({ item: msg }: { item: ChatMessage }) => {
    if (msg.role === 'user') {
      return (
        <View style={styles.userMsgRow}>
          <View style={styles.userBubble}>
            <Text style={styles.userBubbleText}>{msg.text}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.assistantMsgRow}>
        <LottieView
          source={require('../../assets/ai.json')}
          autoPlay
          loop
          style={styles.chatbotAvatar}
        />
        <View style={styles.assistantContent}>
          {/* Text response */}
          <Text style={styles.assistantText}>{msg.text}</Text>

          {/* Individual Food Cards */}
          {msg.foodAnalysis?.items.map((item, i) => (
            <IndividualFoodCard
              key={`${msg.id}-food-${i}`}
              item={item}
              onRemove={() => handleRemoveItem(msg.id, i)}
            />
          ))}

          {/* Combined Food Analysis Card */}
          {msg.foodAnalysis && msg.foodAnalysis.items.length > 0 && (
            <CombinedTotalsCard
              foodAnalysis={msg.foodAnalysis}
              msgId={msg.id}
              selectedMeal={msg.selectedMeals?.[0] || 'Lunch'}
              onMealChange={(meal) => handleMealChangeAll(msg.id, meal)}
              onLog={() => handleLogAll(msg.id, msg.foodAnalysis!.items, msg.selectedMeals?.[0] || 'Lunch')}
              isLogging={!!loggingStates[msg.id]}
              isLogged={msg.loggedItems ? msg.loggedItems.size === msg.foodAnalysis.items.length : false}
            />
          )}
        </View>
      </View>
    );
  }, [loggingStates, handleLogAll, handleMealChangeAll, handleRemoveItem]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <LottieView
        source={require('../../assets/ai.json')}
        autoPlay
        loop
        style={{ width: 160, height: 160 }}
      />

      <View style={styles.exampleChips}>
        {['I had 2 eggs and toast', 'A bowl of oatmeal with banana', 'Chicken breast with rice'].map((ex) => (
          <TouchableOpacity
            key={ex}
            style={styles.exampleChip}
            onPress={() => {
              setInputText(ex);
            }}
          >
            <Text style={styles.exampleChipText}>{ex}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ), []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.chatArea}>
        {/* Top Fade */}
        {showTopFade && (
          <LinearGradient
            colors={['#F8F9FA', 'rgba(248, 249, 250, 0)']}
            style={styles.topFade}
            pointerEvents="none"
          />
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messageList,
            messages.length === 0 && styles.messageListEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={isLoading ? <SkeletonLoader /> : null}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: true });
            }
          }}
        />
      </View>

      {/* Input Bar */}
      <View style={[styles.inputBarOuter, { paddingBottom: Math.max(insets.bottom, 8) + 90 }]}>
        <View style={styles.inputBar}>
          {/* Plus Button */}
          <TouchableOpacity style={styles.plusButton} activeOpacity={0.6}>
            <Plus size={20} color="#6B7280" strokeWidth={2} />
          </TouchableOpacity>

          {/* Text Input */}
          <TextInput
            style={styles.textInput}
            placeholder="Describe what you ate..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
            blurOnSubmit
          />

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.7}
          >
            <ArrowUp size={18} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  chatArea: {
    flex: 1,
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    zIndex: 10,
  },
  messageList: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageListEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Empty State ──
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  exampleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  exampleChip: {
    backgroundColor: '#EEEEEE',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  exampleChipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },

  // ── User Message ──
  userMsgRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  userBubble: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    borderBottomRightRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
  },
  userBubbleText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },

  // ── Assistant Message ──
  assistantMsgRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  assistantContent: {
    maxWidth: '100%',
    flex: 1,
  },
  assistantText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 12,
  },

  // ── Food Card ──
  foodCard: {
    backgroundColor: '#EEEEEE',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  foodCardHeader: {
    marginBottom: 14,
  },
  foodCardName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.3,
  },
  foodCardServing: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
  },

  // ── Macro Grid (same as food-detail) ──
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  macroGridCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
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

  // ── Meal Selector ──
  foodCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealDropdown: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  mealDropdownText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  mealPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
    marginRight: 10,
  },
  mealChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
  },
  mealChipActive: {
    backgroundColor: '#1C1C1E',
  },
  mealChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  mealChipTextActive: {
    color: '#fff',
  },

  // ── Log Button ──
  logFoodBtn: {
    backgroundColor: '#1C1C1E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logFoodBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  loggedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 100,
  },
  loggedBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // ── Totals Summary ──
  totalsSummary: {
    backgroundColor: '#EEEEEE',
    borderRadius: 16,
    padding: 14,
    marginBottom: 4,
  },
  totalsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111',
    marginBottom: 6,
  },
  totalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  totalsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  totalsDivider: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  // ── Skeleton Loader ──
  skeletonWrap: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 10,
  },
  skeletonMacroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  skeletonMacroCard: {
    width: '48%',
    height: 54,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    marginBottom: 8,
  },

  // ── Input Bar ──
  inputBarOuter: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#F8F9FA',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#EEEEEE',
    borderRadius: 24,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  plusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCDCDC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxHeight: 100,
    minHeight: 24,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#C4C4C4',
  },
  combinedItemsList: {
    marginTop: 8,
    gap: 4,
  },
  combinedItemRow: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  chatbotAvatar: {
    width: 32,
    height: 32,
    marginRight: 8,
    marginTop: 2,
  },
  fullWidthLoggedBanner: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 12,
  },
  fullWidthLoggedText: {
    color: '#15803D',
    fontSize: 15,
    fontWeight: '700',
  },
  microSectionCombined: {
    marginTop: 12,
    paddingTop: 12,
  },
  microSectionTitleCombined: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  microListCombined: {
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
  },
  microRowCombined: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  microLabelCombined: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  microValueCombined: {
    fontSize: 14,
    color: '#111',
    fontWeight: '700',
  },
  individualCard: {
    backgroundColor: '#EEEEEE',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  individualCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingRight: 24,
  },
  individualCardName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    flex: 1,
  },
  removeBtn: {
    position: 'absolute',
    top: 0,
    right: -10,
    padding: 4,
  },
  compactMacroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  compactMacroCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
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
  },
  compactMacroGridIcon: {
    width: 11,
    height: 11,
  },
  compactMacroGridText: {
    flex: 1,
  },
  compactMacroLabel: {
    fontSize: 8,
    color: '#6B7280',
    fontWeight: '600',
  },
  compactMacroValue: {
    fontSize: 9,
    fontWeight: '800',
    color: '#111',
    marginTop: 0,
  },
});

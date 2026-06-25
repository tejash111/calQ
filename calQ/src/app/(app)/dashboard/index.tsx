import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { LogOut, Plus, Flame, Home, BarChart2, User, Sparkles, Utensils, Camera, Dumbbell, Barcode, X, Bookmark, Search, Scan } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';
import { useOnboardingProfile, type OnboardingProfile } from '../../../hooks/useOnboardingProfile';
import { getTodayFoodLogs } from '../../../lib/api';

const { width } = Dimensions.get('window');

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Generate a week array starting from a Sunday offset
function getWeekDays(weekOffset: number) {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return {
      dayLetter: DAYS_OF_WEEK[i],
      date: d.getDate(),
      fullDate: d,
      isToday:
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear(),
    };
  });
}

function getMonthLabel(weekOffset: number) {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);
  return startOfWeek.toLocaleString('default', { month: 'long', year: 'numeric' });
}



// ─── TAB BAR ─────────────────────────────────────────────────────────────────
type TabKey = 'home' | 'progress' | 'profile' | 'ai';

interface FloatingTabBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onPlusPress: () => void;
}

function FloatingTabBar({ activeTab, onTabChange, onPlusPress }: FloatingTabBarProps) {
  return (
    <View style={tabStyles.wrapper} pointerEvents="box-none">
      <BlurView intensity={70} tint="light" style={tabStyles.bar}>
        {/* Home */}
        <Pressable style={tabStyles.tab} onPress={() => onTabChange('home')}>
          <Image source={require('../../../../assets/dash/home.svg')} style={{ width: 24, height: 24, opacity: activeTab === 'home' ? 1 : 0.4 }} tintColor={activeTab === 'home' ? '#000' : '#6B7280'} contentFit="contain" />
          <Text style={[tabStyles.tabLabel, activeTab === 'home' && tabStyles.tabLabelActive]}>Home</Text>
        </Pressable>

        {/* Progress */}
        <Pressable style={tabStyles.tab} onPress={() => onTabChange('progress')}>
          <Image source={require('../../../../assets/dash/progress.svg')} style={{ width: 24, height: 24, opacity: activeTab === 'progress' ? 1 : 0.4 }} tintColor={activeTab === 'progress' ? '#000' : '#6B7280'} contentFit="contain" />
          <Text style={[tabStyles.tabLabel, activeTab === 'progress' && tabStyles.tabLabelActive]}>Progress</Text>
        </Pressable>

        {/* Center Plus Spacer */}
        <View style={tabStyles.plusWrap} />

        {/* Profile */}
        <Pressable style={tabStyles.tab} onPress={() => onTabChange('profile')}>
          <Image source={require('../../../../assets/dash/profile.svg')} style={{ width: 24, height: 24, opacity: activeTab === 'profile' ? 1 : 0.4 }} tintColor={activeTab === 'profile' ? '#000' : '#6B7280'} contentFit="contain" />
          <Text style={[tabStyles.tabLabel, activeTab === 'profile' && tabStyles.tabLabelActive]}>Profile</Text>
        </Pressable>

        {/* AI */}
        <Pressable style={tabStyles.tab} onPress={() => onTabChange('ai')}>
          <Image source={require('../../../../assets/dash/describe.svg')} style={{ width: 24, height: 24, opacity: activeTab === 'ai' ? 1 : 0.4 }} tintColor={activeTab === 'ai' ? '#000' : '#6B7280'} contentFit="contain" />
          <Text style={[tabStyles.tabLabel, activeTab === 'ai' && tabStyles.tabLabelActive]}>AI</Text>
        </Pressable>
      </BlurView>

      {/* Floating Plus Button (Outside BlurView to prevent clipping) */}
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]} pointerEvents="box-none">
        <Pressable style={tabStyles.plusBtn} onPress={onPlusPress}>
          <Plus size={28} color="#000" strokeWidth={2.5} />
        </Pressable>
      </View>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    width: '100%',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 2,
  },
  tabLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  tabLabelActive: { color: '#000', fontWeight: '700' },
  plusWrap: {
    width: 60,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#A3E635',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -27 }],
    shadowColor: '#A3E635',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
});

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <View style={{ height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
      <View style={{ width: `${Math.min(progress * 100, 100)}%`, height: '100%', backgroundColor: color, borderRadius: 4 }} />
    </View>
  );
}

// ─── WEEK CALENDAR ───────────────────────────────────────────────────────────
interface WeekCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

function WeekCalendar({ selectedDate, onSelectDate }: WeekCalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const days = getWeekDays(weekOffset);
  const monthLabel = getMonthLabel(weekOffset);
  const today = new Date();

  const touchStartX = React.useRef(0);

  const handleTouchStart = (e: any) => {
    touchStartX.current = e.nativeEvent.pageX;
  };

  const handleMoveShouldSetResponderCapture = (e: any) => {
    const dx = Math.abs(e.nativeEvent.pageX - touchStartX.current);
    return dx > 20;
  };

  const handleResponderRelease = (e: any) => {
    const touchEndX = e.nativeEvent.pageX;
    const dx = touchEndX - touchStartX.current;
    if (dx > 50) {
      // Swipe Right -> Go to previous week (older days)
      setWeekOffset((w) => w - 1);
    } else if (dx < -50) {
      // Swipe Left -> Go to next week (newer days), limit to this week
      setWeekOffset((w) => Math.min(0, w + 1));
    }
  };

  return (
    <View 
      style={calStyles.container}
      onTouchStart={handleTouchStart}
      onMoveShouldSetResponderCapture={handleMoveShouldSetResponderCapture}
      onResponderRelease={handleResponderRelease}
    >
      <View style={calStyles.header}>
        <Text style={calStyles.monthLabel}>{monthLabel}</Text>
      </View>
      <View style={calStyles.daysRow}>
        {days.map((d, i) => {
          const isSelected = 
            d.fullDate.getDate() === selectedDate.getDate() &&
            d.fullDate.getMonth() === selectedDate.getMonth() &&
            d.fullDate.getFullYear() === selectedDate.getFullYear();

          const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const startOfD = new Date(d.fullDate.getFullYear(), d.fullDate.getMonth(), d.fullDate.getDate());
          const isFuture = startOfD > startOfToday;

          return (
            <Pressable
              key={i}
              style={[
                calStyles.dayPill,
                isSelected && calStyles.dayPillSelected,
                isFuture && { opacity: 0.3 }
              ]}
              onPress={() => {
                if (!isFuture) {
                  onSelectDate(d.fullDate);
                }
              }}
              disabled={isFuture}
            >
              <Text style={[calStyles.dayLetter, isSelected && calStyles.dayLetterSelected]}>
                {d.dayLetter}
              </Text>
              <Text style={[calStyles.dayNum, isSelected && calStyles.dayNumSelected]}>
                {String(d.date).padStart(2, '0')}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const calStyles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    marginBottom: 16,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  monthLabel: { fontSize: 17, fontWeight: '700', color: '#000' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  dayPill: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    borderRadius: 16, backgroundColor: 'transparent', gap: 4,
  },
  dayPillSelected: { backgroundColor: '#F0F0F0', borderWidth: 0 },
  dayLetter: { fontSize: 11, color: '#9CA3AF', fontWeight: 'normal' },
  dayLetterSelected: { color: '#000', fontWeight: 'normal' },
  dayNum: { fontSize: 15, color: '#9CA3AF', fontWeight: 'normal' },
  dayNumSelected: { color: '#000', fontWeight: 'normal' },
});

// ─── HOME TAB ─────────────────────────────────────────────────────────────────
interface HomeTabProps {
  userName: string;
  userImageUrl?: string | null;
  profile: OnboardingProfile | null;
  profileLoading: boolean;
  foodLogs: any[];
  logsLoading: boolean;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

function CircularProgress({ progress, size, strokeWidth, color, children, style }: any) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Ensure progress is bounded between 0 and 1
  const boundedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference - boundedProgress * circumference;

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

function HomeTab({ userName, userImageUrl, profile, profileLoading, foodLogs, logsLoading, selectedDate, onSelectDate }: HomeTabProps) {
  const { signOut } = useAuth();
  const router = useRouter();

  const calorieGoal = profile?.daily_calories ?? 2000;
  
  // Calculate totals from logs
  const calorieTaken = foodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const proteinTaken = foodLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
  const carbsTaken = foodLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
  const fatTaken = foodLogs.reduce((sum, log) => sum + (log.fat || 0), 0);

  const calorieProgress = calorieGoal > 0 ? calorieTaken / calorieGoal : 0;
  const remaining = Math.max(0, calorieGoal - calorieTaken);

  const macros = [
    {
      label: 'Protein',
      taken: Math.round(proteinTaken),
      goal: profile?.protein_g ?? 0,
      color: '#EF4444',
      bg: '#F0F0F0',
      source: require('../../../../assets/onboarding/chicken.svg'),
    },
    {
      label: 'Carbs',
      taken: Math.round(carbsTaken),
      goal: profile?.carbs_g ?? 0,
      color: '#F59E0B',
      bg: '#F0F0F0',
      source: require('../../../../assets/onboarding/bread.svg'),
    },
    {
      label: 'Fat',
      taken: Math.round(fatTaken),
      goal: profile?.fat_g ?? 0,
      color: '#3B82F6',
      bg: '#F0F0F0',
      source: require('../../../../assets/onboarding/fats.svg'),
    },
  ];

  const getFoodLogTitle = () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(selectedDate, today)) {
      return "Today's Food Log";
    } else if (isSameDay(selectedDate, yesterday)) {
      return "Yesterday's Food Log";
    } else {
      return `${selectedDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}'s Food Log`;
    }
  };

  const MEAL_ICONS: Record<string, any> = {
    Breakfast: require('../../../../assets/dashboard/breakfast.svg'),
    Lunch: require('../../../../assets/dashboard/lunch.svg'),
    Dinner: require('../../../../assets/dashboard/dinner.svg'),
    Snacks: require('../../../../assets/dashboard/snack.svg'),
  };

  const MEAL_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {userImageUrl ? (
            <Image 
              source={{ uri: userImageUrl }} 
              style={styles.avatarImage} 
            />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{userName[0]?.toUpperCase() ?? 'U'}</Text>
            </View>
          )}
          <View>
            <Text style={styles.greeting}>Good morning! 👋</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </View>
        <Pressable onPress={() => signOut()} style={styles.logoutBtn}>
          <LogOut size={20} color="#6B7280" />
        </Pressable>
      </View>

      {/* Weekly Calendar */}
      <WeekCalendar selectedDate={selectedDate} onSelectDate={onSelectDate} />

      {/* Loading skeleton or real data */}
      {profileLoading || !profile ? (
        <>
          {/* Calories Card Skeleton */}
          <View style={[styles.calorieCard, { opacity: 0.6 }]}>
            <View style={styles.calorieRow}>
              <View style={{ gap: 8 }}>
                <View style={{ width: 140, height: 32, backgroundColor: '#E5E7EB', borderRadius: 8 }} />
                <View style={{ width: 90, height: 16, backgroundColor: '#E5E7EB', borderRadius: 4 }} />
              </View>
              <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: '#E5E7EB' }} />
            </View>
          </View>

          {/* Macro Cards Skeleton */}
          <View style={styles.macroRow}>
            {Array.from({ length: 3 }).map((_, i) => (
              <View key={i} style={[styles.macroCard, { backgroundColor: '#F0F0F0', opacity: 0.6, alignItems: 'center', gap: 6 }]}>
                <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#E5E7EB' }} />
                <View style={{ width: 45, height: 12, backgroundColor: '#E5E7EB', borderRadius: 4, marginTop: 4 }} />
                <View style={{ width: 35, height: 16, backgroundColor: '#E5E7EB', borderRadius: 4 }} />
                <View style={{ width: 25, height: 11, backgroundColor: '#E5E7EB', borderRadius: 4 }} />
              </View>
            ))}
          </View>
        </>
      ) : (
        <>
          {/* Calories Card */}
          <View style={styles.calorieCard}>
            <View style={styles.calorieRow}>
              <View>
                <Text style={styles.calorieMainNum}>
                  {remaining}
                  <Text style={styles.calorieTotal}> kcal</Text>
                </Text>
                <Text style={styles.calorieRemain}>remaining today</Text>
              </View>
              <CircularProgress 
                progress={calorieProgress} 
                size={90} 
                strokeWidth={5} 
                color="#A3E635"
                style={{ backgroundColor: '#fff', borderRadius: 45 }}
              >
                <Image 
                  source={require('../../../../assets/onboarding/burnfat.svg')} 
                  style={{ width: 28, height: 28 }} 
                  contentFit="contain"
                />
              </CircularProgress>
            </View>
          </View>

          {/* Macro Cards */}
          <View style={styles.macroRow}>
            {macros.map((m) => (
              <View key={m.label} style={[styles.macroCard, { backgroundColor: m.bg }]}>
                <CircularProgress 
                  progress={m.goal > 0 ? m.taken / m.goal : 0} 
                  size={60} 
                  strokeWidth={4} 
                  color={m.color}
                  style={{ backgroundColor: '#fff', borderRadius: 30 }}
                >
                  <Image 
                    source={m.source} 
                    style={{ width: 22, height: 22 }} 
                    contentFit="contain"
                  />
                </CircularProgress>
                <Text style={styles.macroLabel}>{m.label}</Text>
                <Text style={[styles.macroVal, { color: m.color }]}>{m.taken}g</Text>
                <Text style={styles.macroGoal}>/ {m.goal}g</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Food Log */}
      <Text style={styles.sectionTitleFoodLog}>{getFoodLogTitle()}</Text>
      
      {logsLoading ? (
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <ActivityIndicator size="small" color="#2b2543" />
        </View>
      ) : (
        MEAL_CATEGORIES.map((meal) => {
          const foods = foodLogs.filter((f) => f.mealType === meal);
          const totalKcal = foods.reduce((s, f) => s + (f.calories || 0), 0);
          return (
            <View key={meal} style={styles.mealGroup}>
              <View style={styles.mealGroupHeader}>
                <View style={styles.mealIconWrap}>
                  <Image 
                    source={MEAL_ICONS[meal]} 
                    style={{ width: 18, height: 18 }} 
                    contentFit="contain" 
                  />
                </View>
                <Text style={styles.mealGroupTitle}>{meal}</Text>
                <Text style={styles.mealGroupKcal}>{totalKcal} kcal</Text>
                <Pressable style={styles.mealAddBtn} onPress={() => router.push('/food-database')}>
                  <Plus size={16} color="#6B7280" />
                </Pressable>
              </View>
              {foods.map((food) => (
                <View key={food.id} style={styles.foodItem}>
                  <Text style={styles.foodEmoji}>🍽️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.foodName} numberOfLines={1}>{food.name}</Text>
                    <Text style={styles.foodTime}>{new Date(food.consumedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                  </View>
                  <Text style={styles.foodKcal}>{food.calories} kcal</Text>
                </View>
              ))}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

// ─── PROGRESS TAB ─────────────────────────────────────────────────────────────
function ProgressTab() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: '#000' }}>Progress</Text>
      <Text style={{ color: '#6B7280', marginTop: 8 }}>Coming soon...</Text>
    </View>
  );
}

// ─── PROFILE TAB ──────────────────────────────────────────────────────────────
import ProfileTab from '../../../components/ProfileTab';

// ─── AI TAB ───────────────────────────────────────────────────────────────────
// Imported from dedicated component
import AIChat from '../../../components/AIChat';

function AITab() {
  return <AIChat />;
}

// ─── QUICK ACTION MODAL ──────────────────────────────────────────────────────
interface ActionModalProps {
  visible: boolean;
  onClose: () => void;
}

function ActionModal({ visible, onClose }: ActionModalProps) {
  const router = useRouter();
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible]);

  const handleAction = (action: string) => {
    onClose();
    if (action === 'food_database') {
      router.push('/(app)/food-database');
    } else if (action === 'scan_food') {
      router.push('/(app)/scan-food');
    } else {
      console.log(`Action chosen: ${action}`);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[modalStyles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          {/* Backdrop Blur */}
          <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />

          <TouchableWithoutFeedback>
            <Animated.View style={[modalStyles.optionsGrid, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
              {/* Log exercise */}
              <TouchableOpacity 
                activeOpacity={0.7}
                style={modalStyles.optionCard}
                onPress={() => handleAction('log_exercise')}
              >
                <Image source={require('../../../../assets/dash/dumbell.svg')} style={{ width: 32, height: 32 }} contentFit="contain" />
                <Text style={modalStyles.optionLabel}>Log exercise</Text>
              </TouchableOpacity>

              {/* Describe to AI */}
              <TouchableOpacity 
                activeOpacity={0.7}
                style={modalStyles.optionCard}
                onPress={() => handleAction('saved_foods')}
              >
                <Image source={require('../../../../assets/dash/describe.svg')} style={{ width: 32, height: 32 }} contentFit="contain" />
                <Text style={modalStyles.optionLabel}>Describe to AI</Text>
              </TouchableOpacity>

              {/* Food Database */}
              <TouchableOpacity 
                activeOpacity={0.7}
                style={modalStyles.optionCard}
                onPress={() => handleAction('food_database')}
              >
                <Image source={require('../../../../assets/dash/fooddb.svg')} style={{ width: 32, height: 32 }} contentFit="contain" />
                <Text style={modalStyles.optionLabel}>Food Database</Text>
              </TouchableOpacity>

              {/* Scan food */}
              <TouchableOpacity 
                activeOpacity={0.7}
                style={modalStyles.optionCard}
                onPress={() => handleAction('scan_food')}
              >
                <Image source={require('../../../../assets/dash/scan.svg')} style={{ width: 32, height: 32 }} contentFit="contain" />
                <Text style={modalStyles.optionLabel}>Scan food</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    backgroundColor: 'transparent',
  },
  optionCard: {
    width: (width - 52) / 2, // 2 items per row with gap 12 and padding 20
    height: 110,
    backgroundColor: '#F0F0F0', // Matched exactly to the calorie card bg
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
  },
});

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const { profile, loading: profileLoading } = useOnboardingProfile();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [foodLogs, setFoodLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchLogs = async () => {
        try {
          setLogsLoading(true);
          const token = await getToken();
          const data = await getTodayFoodLogs(token, selectedDate);
          if (isActive && data.logs) {
            setFoodLogs(data.logs);
          }
        } catch (error) {
          console.error("Failed to fetch food logs:", error);
        } finally {
          if (isActive) setLogsLoading(false);
        }
      };
      fetchLogs();
      return () => { isActive = false; };
    }, [selectedDate])
  );

  React.useEffect(() => {
    // If finished loading and still no profile, force user to onboarding
    if (!profileLoading && !profile) {
      router.replace('/onboarding');
    }
  }, [profile, profileLoading, router]);

  const firstName = user?.firstName ?? user?.username ?? 'there';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <View style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <HomeTab
            userName={firstName}
            userImageUrl={user?.imageUrl}
            profile={profile}
            profileLoading={profileLoading}
            foodLogs={foodLogs}
            logsLoading={logsLoading}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}
        {activeTab === 'progress' && <ProgressTab />}
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'ai' && <AITab />}
      </View>
      <FloatingTabBar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onPlusPress={() => setIsActionModalVisible(true)}
      />
      <ActionModal 
        visible={isActionModalVisible} 
        onClose={() => setIsActionModalVisible(false)} 
      />
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 36,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#A3E635',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
  greeting: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  logoutBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Calorie Card
  calorieCard: {
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    borderWidth: 0,
    padding: 20,
    marginBottom: 20,
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calorieMainNum: {
    fontSize: 36,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -1,
  },
  calorieTotal: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  calorieRemain: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  calorieProgressCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  // Macros
  macroRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  macroCard: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  macroProgressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  macroLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 4,
  },
  macroVal: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  macroGoal: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Food Log
  sectionTitleFoodLog: {
    fontSize: 16,
    fontWeight: '400',
    color: '#374151',
    marginBottom: 12,
  },
  mealGroup: {
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    borderWidth: 0,
    marginBottom: 12,
    overflow: 'hidden',
  },
  mealGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  mealIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealGroupTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  mealGroupKcal: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  mealAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  foodEmoji: {
    fontSize: 28,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  foodTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  foodKcal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },

  // Loading / Empty state
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 28,
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  noProfileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 32,
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  noProfileEmoji: { fontSize: 48 },
  noProfileTitle: { fontSize: 18, fontWeight: '800', color: '#000' },
  noProfileSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});

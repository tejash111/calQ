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
} from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LogOut, Plus, Flame, Home, BarChart2, User, Sparkles } from 'lucide-react-native';
import { useOnboardingProfile, type OnboardingProfile } from '../../../hooks/useOnboardingProfile';

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

// Today's logged foods — will be replaced with real DB data in future
const MOCK_FOODS: Array<{ id: string; meal: string; name: string; kcal: number; time: string; emoji: string }> = [];

// Calories taken today — will be tracked from food log in future
const CALORIES_TAKEN_TODAY = 0;

// ─── TAB BAR ─────────────────────────────────────────────────────────────────
type TabKey = 'home' | 'progress' | 'profile' | 'ai';

interface FloatingTabBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

function FloatingTabBar({ activeTab, onTabChange }: FloatingTabBarProps) {
  return (
    <View style={tabStyles.wrapper} pointerEvents="box-none">
      <View style={tabStyles.bar}>
        {/* Home */}
        <Pressable style={tabStyles.tab} onPress={() => onTabChange('home')}>
          <Home size={22} color={activeTab === 'home' ? '#000' : '#9CA3AF'} strokeWidth={activeTab === 'home' ? 2.5 : 1.5} />
          <Text style={[tabStyles.tabLabel, activeTab === 'home' && tabStyles.tabLabelActive]}>Home</Text>
        </Pressable>

        {/* Progress */}
        <Pressable style={tabStyles.tab} onPress={() => onTabChange('progress')}>
          <BarChart2 size={22} color={activeTab === 'progress' ? '#000' : '#9CA3AF'} strokeWidth={activeTab === 'progress' ? 2.5 : 1.5} />
          <Text style={[tabStyles.tabLabel, activeTab === 'progress' && tabStyles.tabLabelActive]}>Progress</Text>
        </Pressable>

        {/* Center Plus */}
        <View style={tabStyles.plusWrap}>
          <Pressable style={tabStyles.plusBtn}>
            <Plus size={28} color="#000" strokeWidth={2.5} />
          </Pressable>
        </View>

        {/* Profile */}
        <Pressable style={tabStyles.tab} onPress={() => onTabChange('profile')}>
          <User size={22} color={activeTab === 'profile' ? '#000' : '#9CA3AF'} strokeWidth={activeTab === 'profile' ? 2.5 : 1.5} />
          <Text style={[tabStyles.tabLabel, activeTab === 'profile' && tabStyles.tabLabelActive]}>Profile</Text>
        </Pressable>

        {/* AI */}
        <Pressable style={tabStyles.tab} onPress={() => onTabChange('ai')}>
          <Sparkles size={22} color={activeTab === 'ai' ? '#000' : '#9CA3AF'} strokeWidth={activeTab === 'ai' ? 2.5 : 1.5} />
          <Text style={[tabStyles.tabLabel, activeTab === 'ai' && tabStyles.tabLabelActive]}>AI</Text>
        </Pressable>
      </View>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 28,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 12,
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
function WeekCalendar() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const days = getWeekDays(weekOffset);
  const monthLabel = getMonthLabel(weekOffset);

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
          const isSelected = d.date === selectedDate;
          return (
            <Pressable
              key={i}
              style={[calStyles.dayPill, isSelected && calStyles.dayPillSelected]}
              onPress={() => setSelectedDate(d.date)}
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
}

function getCircleProgressStyle(progress: number, color: string) {
  const customStyle: any = {
    borderColor: '#E5E7EB',
  };
  if (progress >= 0.25) {
    customStyle.borderTopColor = color;
  }
  if (progress >= 0.5) {
    customStyle.borderLeftColor = color;
  }
  if (progress >= 0.75) {
    customStyle.borderRightColor = color;
  }
  if (progress >= 1.0) {
    customStyle.borderBottomColor = color;
  }
  return customStyle;
}

function HomeTab({ userName, userImageUrl, profile, profileLoading }: HomeTabProps) {
  const { signOut } = useAuth();

  const calorieGoal = profile?.daily_calories ?? 2000;
  const calorieTaken = CALORIES_TAKEN_TODAY;
  const calorieProgress = calorieGoal > 0 ? calorieTaken / calorieGoal : 0;
  const remaining = calorieGoal - calorieTaken;

  const macros = [
    {
      label: 'Protein',
      taken: 0,
      goal: profile?.protein_g ?? 0,
      color: '#EF4444',
      bg: '#F0F0F0',
      source: require('../../../../assets/onboarding/chicken.svg'),
    },
    {
      label: 'Carbs',
      taken: 0,
      goal: profile?.carbs_g ?? 0,
      color: '#F59E0B',
      bg: '#F0F0F0',
      source: require('../../../../assets/onboarding/bread.svg'),
    },
    {
      label: 'Fat',
      taken: 0,
      goal: profile?.fat_g ?? 0,
      color: '#3B82F6',
      bg: '#F0F0F0',
      source: require('../../../../assets/onboarding/fats.svg'),
    },
  ];

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
      <WeekCalendar />

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
              <View style={[styles.calorieProgressCircle, getCircleProgressStyle(calorieProgress, '#A3E635')]}>
                <Image 
                  source={require('../../../../assets/onboarding/burnfat.svg')} 
                  style={{ width: 28, height: 28 }} 
                  contentFit="contain"
                />
              </View>
            </View>
          </View>

          {/* Macro Cards */}
          <View style={styles.macroRow}>
            {macros.map((m) => (
              <View key={m.label} style={[styles.macroCard, { backgroundColor: m.bg }]}>
                <View style={[styles.macroProgressCircle, getCircleProgressStyle(m.goal > 0 ? m.taken / m.goal : 0, m.color)]}>
                  <Image 
                    source={m.source} 
                    style={{ width: 22, height: 22 }} 
                    contentFit="contain"
                  />
                </View>
                <Text style={styles.macroLabel}>{m.label}</Text>
                <Text style={[styles.macroVal, { color: m.color }]}>{m.taken}g</Text>
                <Text style={styles.macroGoal}>/ {m.goal}g</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Food Log */}
      <Text style={styles.sectionTitleFoodLog}>Today's Food Log</Text>
      {MEAL_CATEGORIES.map((meal) => {
        const foods = MOCK_FOODS.filter((f) => f.meal === meal);
        const totalKcal = foods.reduce((s, f) => s + f.kcal, 0);
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
              <Pressable style={styles.mealAddBtn}>
                <Plus size={16} color="#6B7280" />
              </Pressable>
            </View>
            {foods.map((food) => (
              <View key={food.id} style={styles.foodItem}>
                <Text style={styles.foodEmoji}>{food.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text style={styles.foodTime}>{food.time}</Text>
                </View>
                <Text style={styles.foodKcal}>{food.kcal} kcal</Text>
              </View>
            ))}
          </View>
        );
      })}
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
function ProfileTab() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: '#000' }}>Profile</Text>
      <Text style={{ color: '#6B7280', marginTop: 8 }}>Coming soon...</Text>
    </View>
  );
}

// ─── AI TAB ───────────────────────────────────────────────────────────────────
function AITab() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '800', color: '#000' }}>AI Assistant</Text>
      <Text style={{ color: '#6B7280', marginTop: 8 }}>Coming soon...</Text>
    </View>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const { profile, loading: profileLoading } = useOnboardingProfile();
  const router = useRouter();

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
          />
        )}
        {activeTab === 'progress' && <ProgressTab />}
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'ai' && <AITab />}
      </View>
      <FloatingTabBar activeTab={activeTab} onTabChange={setActiveTab} />
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

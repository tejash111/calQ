import React, { useState, useEffect, useRef } from 'react';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Animated as RNAnimated,
  TextInput,
  Alert,
} from 'react-native';
import Reanimated, { FadeInRight } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ArrowRight, Check } from 'lucide-react-native';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { ScrollPicker } from '../../components/ScrollPicker';
import { saveOnboarding, generateNutritionPlan, type NutritionPlan, type UserProfile } from '../../lib/api';
import { useUser, useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 9;
const STORAGE_KEY = 'calq_onboarding_data';

// --- Data generation ---
const generateRange = (start: number, end: number, suffix: string) =>
  Array.from({ length: end - start + 1 }, (_, i) => `${start + i}${suffix ? ' ' + suffix : ''}`);

const WEIGHT_VALUES = generateRange(30, 200, 'kg');
const HEIGHT_VALUES = generateRange(130, 220, 'cm');
const DESIRED_WEIGHT_VALUES = generateRange(30, 200, 'kg');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const YEARS = Array.from({ length: 71 }, (_, i) => String(1940 + i));

type Goal = 'lose_fat' | 'gain_muscle' | 'maintain_weight';
type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';
type Pace = 'slow' | 'balanced' | 'aggressive';

interface OnboardingData {
  goal: Goal | null;
  gender: Gender | null;
  weight: string;
  height: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  desiredWeight: string;
  activityLevel: ActivityLevel | null;
  pace: Pace | null;
  connectFit: boolean;
  nutrition: NutritionPlan | null;
}



export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    goal: null,
    gender: null,
    weight: '70 kg',
    height: '174 cm',
    birthDay: '15',
    birthMonth: 'Jan',
    birthYear: '1998',
    desiredWeight: '65 kg',
    activityLevel: null,
    pace: 'balanced',
    connectFit: false,
    nutrition: null,
  });

  // Restore from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(async (str) => {
        if (str) {
          const savedData = JSON.parse(str) as OnboardingData;
          setData(savedData);
          if (savedData.nutrition) {
            if (user) {
              // User is authenticated, auto-save and redirect
              try {
                const token = await getToken();
                if (token) {
                  await saveOnboarding(token, {
                    goal: savedData.goal,
                    gender: savedData.gender,
                    weight: savedData.weight,
                    height: savedData.height,
                    birth_day: savedData.birthDay,
                    birth_month: savedData.birthMonth,
                    birth_year: savedData.birthYear,
                    desired_weight: savedData.desiredWeight,
                    activity_level: savedData.activityLevel,
                    pace: savedData.pace,
                    connect_fit: savedData.connectFit,
                    daily_calories: savedData.nutrition.dailyCalories,
                    protein_g: savedData.nutrition.protein,
                    carbs_g: savedData.nutrition.carbohydrates,
                    fat_g: savedData.nutrition.fat,
                  });
                  await AsyncStorage.removeItem(STORAGE_KEY);
                  router.replace('/dashboard');
                } else {
                  setStep(9);
                }
              } catch (e) {
                console.error('Auto-save failed:', e);
                Alert.alert('Save Failed', 'Could not save your profile. Please check your connection and try again.');
                setStep(9);
              }
            } else {
              setStep(9);
            }
          }
        }
      })
      .catch(console.error);
  }, [user]);

  // Save to AsyncStorage whenever data changes
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(console.error);
  }, [data]);

  const effectiveTotal = data.goal === 'maintain_weight' ? TOTAL_STEPS - 1 : TOTAL_STEPS;

  const goNext = () => {
    let nextStep = step + 1;
    if (nextStep === 5 && data.goal === 'maintain_weight') nextStep = 6;
    if (nextStep > TOTAL_STEPS) {
      handleComplete();
    } else {
      setStep(nextStep);
    }
  };

  const goBack = () => {
    let prevStep = step - 1;
    if (prevStep === 5 && data.goal === 'maintain_weight') prevStep = 4;
    if (prevStep < 1) return;
    setStep(prevStep);
  };

  const handleComplete = async () => {
    try {
      if (!user) {
        // User not signed in. Data is preserved in AsyncStorage.
        // Redirect them to sign in/up to create an account!
        router.replace('/sign-up');
        return;
      }

      if (data.nutrition) {
        const token = await getToken();
        if (token) {
          await saveOnboarding(token, {
            goal: data.goal,
            gender: data.gender,
            weight: data.weight,
            height: data.height,
            birth_day: data.birthDay,
            birth_month: data.birthMonth,
            birth_year: data.birthYear,
            desired_weight: data.desiredWeight,
            activity_level: data.activityLevel,
            pace: data.pace,
            connect_fit: data.connectFit,
            daily_calories: data.nutrition.dailyCalories,
            protein_g: data.nutrition.protein,
            carbs_g: data.nutrition.carbohydrates,
            fat_g: data.nutrition.fat,
          });
          console.log('Onboarding data saved successfully!');
          // Clear local onboarding data only on success
          await AsyncStorage.removeItem(STORAGE_KEY);
          router.replace('/dashboard');
        } else {
          Alert.alert('Error', 'Authentication missing. Please sign in.');
        }
      }
    } catch (e) {
      console.error('Exception in handleComplete:', e);
      Alert.alert('Save Failed', 'Something went wrong while saving your profile. Please try again.');
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return data.goal !== null;
      case 2: return data.gender !== null;
      case 6: return data.activityLevel !== null;
      case 9: return data.nutrition !== null;
      default: return true;
    }
  };

  const displayStep = data.goal === 'maintain_weight' && step >= 5 ? step - 1 : step;
  const showFooter = step !== 8 && step !== 9;

  return (
    <View style={styles.safe}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 18, paddingBottom: 16 }]}>
        {step > 1 && step !== 9 ? (
          <Pressable onPress={goBack} style={styles.backBtn} hitSlop={12}>
            <ChevronLeft size={24} color="#000" />
          </Pressable>
        ) : (
          <View style={{ width: 40, height: 40, flexShrink: 0 }} />
        )}
        <OnboardingProgress currentStep={displayStep} totalSteps={effectiveTotal} />
        <View style={{ width: 40, height: 40, flexShrink: 0 }} />
      </View>

      {/* Step Content & Footer Animated Wrapper */}
      <Reanimated.View key={step} entering={FadeInRight.duration(300)} style={{ flex: 1 }}>
        <View style={styles.content}>
          {step === 1 && <StepGoal data={data} setData={setData} />}
          {step === 2 && <StepGender data={data} setData={setData} />}
          {step === 3 && <StepWeightHeight data={data} setData={setData} />}
          {step === 4 && <StepDateOfBirth data={data} setData={setData} />}
          {step === 5 && <StepDesiredWeight data={data} setData={setData} />}
          {step === 6 && <StepActivityLevel data={data} setData={setData} />}
          {step === 7 && <StepPace data={data} setData={setData} />}
          {step === 8 && (
            <StepConnectFit
              data={data}
              setData={setData}
              onSkip={() => setStep(9)}
              onConnect={() => {
                setData((d) => ({ ...d, connectFit: true }));
                setStep(9);
              }}
            />
          )}
          {step === 9 && (
            <StepAIResults
              data={data}
              setData={setData}
              onComplete={handleComplete}
            />
          )}
        </View>

        {/* Continue Button (hidden on step 8 & 9) */}
        {showFooter && (
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <Pressable
              style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
              onPress={goNext}
              disabled={!canProceed()}
            >
              <Text style={styles.nextBtnText}>Continue</Text>
              <ArrowRight size={20} color="#000" />
            </Pressable>
          </View>
        )}
      </Reanimated.View>
    </View>
  );
}

// ─── Step Props ──────────────────────────────────────────────────────────────
interface StepProps {
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  onSkip?: () => void;
  onConnect?: () => void;
  onComplete?: () => void;
}

// ─── Step 1: Goal ───────────────────────────────────────────────────────────
function StepGoal({ data, setData }: StepProps) {
  const goals: { id: Goal; label: string; desc: string; source: any }[] = [
    { 
      id: 'lose_fat', 
      label: 'Lose Fat', 
      desc: 'Burn calories & reduce body fat',
      source: require('../../../assets/onboarding/burnfat.svg')
    },
    { 
      id: 'gain_muscle', 
      label: 'Gain Muscle', 
      desc: 'Build strength & lean mass',
      source: require('../../../assets/onboarding/muscle.svg')
    },
    { 
      id: 'maintain_weight', 
      label: 'Maintain Weight', 
      desc: 'Stay balanced & healthy',
      source: require('../../../assets/onboarding/maintain.svg')
    },
  ];

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What is your goal?</Text>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.optionsContainer}>
          {goals.map((goal) => {
            const selected = data.goal === goal.id;
            return (
              <Pressable 
                key={goal.id} 
                style={[
                  styles.goalCard, 
                  selected && styles.goalCardSelected
                ]}
                onPress={() => setData((d) => ({ ...d, goal: goal.id }))}
              >
                <View style={styles.goalIconCircle}>
                  <Image 
                    source={goal.source} 
                    style={{ width: 28, height: 28 }} 
                    contentFit="contain"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.goalLabel}>{goal.label}</Text>
                  <Text style={[styles.goalDesc, selected && styles.goalDescSelected]}>
                    {goal.desc}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── Step 2: Gender ──────────────────────────────────────────────────────────
function StepGender({ data, setData }: StepProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What's your gender?</Text>
      <Text style={styles.stepSubtitle}>This helps us calculate your metabolism.</Text>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.genderRow}>
          {(['male', 'female'] as Gender[]).map((g) => {
            const selected = data.gender === g;
            const source = g === 'male' 
              ? require('../../../assets/onboarding/male.svg')
              : require('../../../assets/onboarding/female.svg');
            return (
              <Pressable 
                key={g} 
                style={[styles.genderCard, selected && styles.genderCardSelected]}
                onPress={() => setData((d) => ({ ...d, gender: g }))}
              >
                <View style={styles.goalIconCircle}>
                  <Image 
                    source={source} 
                    style={{ width: 28, height: 28 }} 
                    contentFit="contain"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.genderLabel}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── Step 3: Weight + Height ─────────────────────────────────────────────────
function StepWeightHeight({ data, setData }: StepProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Your measurements</Text>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.pickerRow}>
          <View style={styles.pickerCol}>
            <Text style={styles.pickerLabel}>Height</Text>
            <ScrollPicker values={HEIGHT_VALUES} selectedValue={data.height}
              onValueChange={(v) => setData((d) => ({ ...d, height: v }))} />
          </View>
          <View style={styles.pickerCol}>
            <Text style={styles.pickerLabel}>Weight</Text>
            <ScrollPicker values={WEIGHT_VALUES} selectedValue={data.weight}
              onValueChange={(v) => setData((d) => ({ ...d, weight: v }))} />
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Step 4: Date of Birth ───────────────────────────────────────────────────
function StepDateOfBirth({ data, setData }: StepProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Date of Birth</Text>
      <Text style={styles.stepSubtitle}>We use this to calculate your BMR accurately.</Text>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.pickerRow}>
          <View style={styles.pickerCol}>
            <Text style={styles.pickerLabel}>Day</Text>
            <ScrollPicker values={DAYS} selectedValue={data.birthDay}
              onValueChange={(v) => setData((d) => ({ ...d, birthDay: v }))} />
          </View>
          <View style={styles.pickerCol}>
            <Text style={styles.pickerLabel}>Month</Text>
            <ScrollPicker values={MONTHS} selectedValue={data.birthMonth}
              onValueChange={(v) => setData((d) => ({ ...d, birthMonth: v }))} />
          </View>
          <View style={styles.pickerCol}>
            <Text style={styles.pickerLabel}>Year</Text>
            <ScrollPicker values={YEARS} selectedValue={data.birthYear}
              onValueChange={(v) => setData((d) => ({ ...d, birthYear: v }))} />
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Step 5: Desired Weight ──────────────────────────────────────────────────
function StepDesiredWeight({ data, setData }: StepProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Your dream weight</Text>
      <Text style={styles.stepSubtitle}>Scroll to your target weight.</Text>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.singlePickerWrap}>
          <Text style={styles.pickerLabel}>Target Weight</Text>
          <ScrollPicker values={DESIRED_WEIGHT_VALUES} selectedValue={data.desiredWeight}
            onValueChange={(v) => setData((d) => ({ ...d, desiredWeight: v }))} />
        </View>
      </View>
    </View>
  );
}

// ─── Step 6: Activity Level ──────────────────────────────────────────────────
function StepActivityLevel({ data, setData }: StepProps) {
  const levels: { id: ActivityLevel; label: string; sub: string; source: any }[] = [
    { 
      id: 'sedentary', 
      label: 'Desk Dweller', 
      sub: 'Little to no exercise, mostly sitting', 
      source: require('../../../assets/onboarding/desk.svg') 
    },
    { 
      id: 'light', 
      label: 'Lightly Active', 
      sub: '1–3 days of light exercise per week', 
      source: require('../../../assets/onboarding/walking.svg') 
    },
    { 
      id: 'moderate', 
      label: 'Moderately Active', 
      sub: '3–5 days of solid workout per week', 
      source: require('../../../assets/onboarding/workout.svg') 
    },
    { 
      id: 'very_active', 
      label: 'Athlete Mode', 
      sub: '6–7 days of intense training per week', 
      source: require('../../../assets/onboarding/bodybuilder.svg') 
    },
  ];

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>How active are you?</Text>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.optionsContainer}>
          {levels.map((level) => {
            const selected = data.activityLevel === level.id;
            return (
              <Pressable 
                key={level.id} 
                style={[
                  styles.goalCard, 
                  selected && styles.goalCardSelected
                ]}
                onPress={() => setData((d) => ({ ...d, activityLevel: level.id }))}
              >
                <View style={styles.goalIconCircle}>
                  <Image 
                    source={level.source} 
                    style={{ width: 28, height: 28 }} 
                    contentFit="contain"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.goalLabel}>{level.label}</Text>
                  <Text style={[styles.goalDesc, selected && styles.goalDescSelected]}>
                    {level.sub}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── Step 7: Pace ────────────────────────────────────────────────────────────
function StepPace({ data, setData }: StepProps) {
  const paces: { id: Pace; label: string; sub: string; source: any }[] = [
    { 
      id: 'slow', 
      label: 'Steady & Sustainable', 
      sub: 'Gradual progress, lowest risk, great for lifestyle changes', 
      source: require('../../../assets/onboarding/slow.svg') 
    },
    { 
      id: 'balanced', 
      label: 'Balanced & Consistent', 
      sub: 'The sweet spot — healthy pace with visible results', 
      source: require('../../../assets/onboarding/balance.svg') 
    },
    { 
      id: 'aggressive', 
      label: 'Fast & Focused', 
      sub: 'Rapid results, requires strong commitment & discipline', 
      source: require('../../../assets/onboarding/fast.svg') 
    },
  ];

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>How fast do you want results?</Text>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.optionsContainer}>
          {paces.map((pace) => {
            const selected = data.pace === pace.id;
            return (
              <Pressable 
                key={pace.id} 
                style={[
                  styles.goalCard, 
                  selected && styles.goalCardSelected
                ]}
                onPress={() => setData((d) => ({ ...d, pace: pace.id }))}
              >
                <View style={styles.goalIconCircle}>
                  <Image 
                    source={pace.source} 
                    style={{ width: 28, height: 28 }} 
                    contentFit="contain"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.goalLabel}>{pace.label}</Text>
                  <Text style={[styles.goalDesc, selected && styles.goalDescSelected]}>
                    {pace.sub}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── Step 8: Connect Google Fit ──────────────────────────────────────────────
function StepConnectFit({ data, setData, onSkip, onConnect }: StepProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Connect Google Fit</Text>
      <Text style={styles.stepSubtitle}>
        Sync your steps, workouts, and health data automatically. You can always do this later.
      </Text>
      <View style={{ flex: 1, justifyContent: 'center', gap: 20 }}>
        <View style={styles.fitCard}>
          <Image 
            source={require('../../../assets/onboarding/googlefit.png')} 
            style={{ width: 80, height: 80, marginBottom: 8 }} 
            contentFit="contain"
          />
          <Text style={styles.fitCardTitle}>Google Fit</Text>
          <Text style={styles.fitCardSub}>
            Automatically import your daily step count, active minutes, and burned calories.
          </Text>
        </View>
        <View style={styles.fitBtnGroup}>
          <Pressable style={styles.fitConnectBtn} onPress={onConnect}>
            <Text style={styles.fitConnectText}>Connect Google Fit</Text>
          </Pressable>
          <Pressable style={styles.fitSkipBtn} onPress={onSkip}>
            <Text style={styles.fitSkipText}>Skip for now</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Step 9: AI Nutrition Results ────────────────────────────────────────────
function StepAIResults({ data, setData, onComplete }: StepProps) {
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, 3));
    }, 1200);

    // Call AI via server
    const fetchPlan = async () => {
      try {
        const token = await getToken();

        const profile: UserProfile = {
          goal: data.goal!,
          gender: data.gender!,
          weight: data.weight,
          height: data.height,
          birthDay: data.birthDay,
          birthMonth: data.birthMonth,
          birthYear: data.birthYear,
          desiredWeight: data.goal !== 'maintain_weight' ? data.desiredWeight : undefined,
          activityLevel: data.activityLevel!,
          pace: data.pace!,
        };
        const plan = await generateNutritionPlan(token, profile);
        setData((d) => ({ ...d, nutrition: plan }));
        // Save updated data with nutrition to AsyncStorage
        const updatedData = { ...data, nutrition: plan };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      } catch (e: any) {
        setError(e?.message ?? 'Failed to generate plan. Please try again.');
      } finally {
        clearInterval(interval);
        setLoading(false);
      }
    };

    fetchPlan();
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    const checklist = [
      'Analyzing profile data...',
      'Calculating BMR & TDEE...',
      'Balancing macronutrients...',
      'Generating custom plan...',
    ];

    return (
      <View style={styles.aiLoadingContainer}>
        <Text style={styles.aiLoadingTitle}>Calculating your personalized plan...</Text>
        
        <LottieView
          source={require('../../../assets/onboarding/calculating.json')}
          autoPlay
          loop
          style={{ width: 180, height: 180, marginVertical: 20 }}
        />

        <View style={styles.checklistContainer}>
          {checklist.map((item, index) => {
            const isCompleted = loadingStep > index;
            const isCurrent = loadingStep === index;
            return (
              <View key={index} style={styles.checklistItem}>
                <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>
                  {isCompleted && <Check size={14} color="#fff" />}
                </View>
                <Text style={[
                  styles.checklistText,
                  isCompleted && styles.checklistTextCompleted,
                  isCurrent && styles.checklistTextCurrent
                ]}>
                  {item}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.aiLoadingContainer}>
        <Text style={styles.aiErrorTitle}>Oops!</Text>
        <Text style={styles.aiErrorMsg}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={() => {
          setLoading(true);
          setError(null);
          setData((d) => ({ ...d, nutrition: null }));
        }}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  const plan = data.nutrition!;

  const macros = [
    { 
      id: 'protein',
      label: 'Protein', 
      value: plan.protein, 
      color: '#EF4444', 
      source: require('../../../assets/onboarding/chicken.svg') 
    },
    { 
      id: 'carbohydrates',
      label: 'Carbs', 
      value: plan.carbohydrates, 
      color: '#F59E0B', 
      source: require('../../../assets/onboarding/bread.svg') 
    },
    { 
      id: 'fat',
      label: 'Fat', 
      value: plan.fat, 
      color: '#3B82F6', 
      source: require('../../../assets/onboarding/fats.svg') 
    },
  ];

  return (
    <ScrollView 
      style={{ flex: 1 }} 
      contentContainerStyle={styles.aiResultsScroll} 
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.stepTitle}>Your Nutrition Plan</Text>
      <Text style={styles.stepSubtitle}>Personalised by AI based on your profile.</Text>

      {/* Calorie Progress Circle */}
      <View style={styles.calorieCard}>
        <View style={styles.calorieProgressCircle}>
          <Image 
            source={require('../../../assets/onboarding/burnfat.svg')} 
            style={{ width: 32, height: 32, marginBottom: 6 }} 
            contentFit="contain"
          />
          <TextInput
            style={styles.calorieValueText}
            value={String(plan.dailyCalories)}
            onChangeText={(val) => {
              const num = parseInt(val, 10);
              if (!isNaN(num)) {
                setData((d) => ({ ...d, nutrition: { ...d.nutrition!, dailyCalories: num } }));
              } else if (val === '') {
                setData((d) => ({ ...d, nutrition: { ...d.nutrition!, dailyCalories: 0 } }));
              }
            }}
            keyboardType="numeric"
            maxLength={5}
            selectTextOnFocus
          />
          <Text style={styles.calorieLabelText}>kcal / day</Text>
        </View>
      </View>

      {/* Macro Progress Circles */}
      <View style={styles.macroRow}>
        {macros.map((m) => (
          <View key={m.label} style={styles.macroCard}>
            <View style={[styles.macroProgressCircle, { borderColor: '#E5E7EB', borderTopColor: m.color, borderLeftColor: m.color }]}>
              <Image 
                source={m.source} 
                style={{ width: 24, height: 24, marginBottom: 4 }} 
                contentFit="contain"
              />
              <TextInput
                style={styles.macroValueText}
                value={String(m.value)}
                onChangeText={(val) => {
                  const num = parseInt(val, 10);
                  if (!isNaN(num)) {
                    setData((d) => ({ ...d, nutrition: { ...d.nutrition!, [m.id]: num } }));
                  } else if (val === '') {
                    setData((d) => ({ ...d, nutrition: { ...d.nutrition!, [m.id]: 0 } }));
                  }
                }}
                keyboardType="numeric"
                maxLength={4}
                selectTextOnFocus
              />
              <Text style={styles.macroLabelText}>{m.label}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={[styles.summaryCard, { backgroundColor: '#F3F4F6', borderWidth: 0 }]}>
        <Text style={styles.summaryTitle}>About your plan</Text>
        <Text style={styles.summaryText}>{plan.summary}</Text>
      </View>

      {/* Sign Up / Complete Button */}
      <Pressable style={styles.signUpBtn} onPress={onComplete}>
        <Text style={styles.signUpBtnText}>Complete Sign Up 🎉</Text>
      </Pressable>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 12, paddingHorizontal: 16, paddingBottom: 12, gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB', flexShrink: 0,
  },
  content: { flex: 1 },
  footer: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 12 },
  nextBtn: {
    backgroundColor: '#A3E635', borderRadius: 999, height: 48,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  nextBtnDisabled: { opacity: 0.45 },
  nextBtnText: { fontSize: 17, fontWeight: '700', color: '#000' },

  // Step shared
  stepContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  stepTitle: { fontSize: 30, fontWeight: '400', color: '#000', letterSpacing: -0.5, marginBottom: 8 },
  stepSubtitle: { fontSize: 15, color: '#6B7280', marginBottom: 32, lineHeight: 22 },

  // Goal Option cards
  goalCard: {
    backgroundColor: '#F3F4F6', borderRadius: 18, borderWidth: 0,
    paddingHorizontal: 18, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  goalCardSelected: { backgroundColor: '#D2F396' },
  goalIconCircle: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  goalLabel: { fontSize: 16, fontWeight: '700', color: '#000' },
  goalDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  goalDescSelected: { color: '#374151' },

  // Option cards
  optionsContainer: { gap: 12 },
  optionCard: {
    backgroundColor: '#fff', borderRadius: 18, borderWidth: 2, borderColor: '#E5E7EB',
    paddingHorizontal: 18, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  optionCardSelected: { borderColor: '#A3E635', backgroundColor: '#F7FEE7' },
  optionEmoji: { fontSize: 28 },
  optionLabel: { fontSize: 16, fontWeight: '700', color: '#000' },
  optionLabelSelected: { color: '#000' },
  optionDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center' },
  radioOuterSelected: { borderColor: '#A3E635' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#A3E635' },

  // Gender
  genderRow: { flexDirection: 'column', gap: 12 },
  genderCard: {
    backgroundColor: '#F3F4F6', borderRadius: 18, borderWidth: 0,
    paddingHorizontal: 18, paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', gap: 16,
  },
  genderCardSelected: { backgroundColor: '#D2F396' },
  genderLabel: { fontSize: 16, fontWeight: '700', color: '#000' },

  // Pickers
  pickerRow: {
    flexDirection: 'row', overflow: 'hidden', padding: 8, flex: 1, maxHeight: 420,
  },
  pickerCol: { flex: 1, alignItems: 'center', paddingTop: 12 },
  pickerLabel: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 12 },
  singlePickerWrap: {
    padding: 16, flex: 1, maxHeight: 420, alignItems: 'center',
  },

  // Google Fit
  fitCard: {
    padding: 28, alignItems: 'center', gap: 12, marginBottom: 24,
  },
  fitEmoji: { fontSize: 56 },
  fitCardTitle: { fontSize: 22, fontWeight: '800', color: '#000' },
  fitCardSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 21 },
  fitBtnGroup: { gap: 12 },
  fitConnectBtn: { backgroundColor: '#A3E635', borderRadius: 999, height: 58, alignItems: 'center', justifyContent: 'center' },
  fitConnectText: { fontSize: 17, fontWeight: '700', color: '#000' },
  fitSkipBtn: { height: 52, alignItems: 'center', justifyContent: 'center' },
  fitSkipText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },

  // AI Loading
  aiLoadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 24,
  },
  aiLoadingTitle: { fontSize: 24, fontWeight: '700', color: '#000', textAlign: 'center', marginBottom: 8 },
  checklistContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    gap: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#A3E635',
    borderColor: '#A3E635',
  },
  checklistText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  checklistTextCurrent: {
    color: '#000',
    fontWeight: '600',
  },
  checklistTextCompleted: {
    color: '#374151',
  },
  aiErrorTitle: { fontSize: 28, fontWeight: '800', color: '#000' },
  aiErrorMsg: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  retryBtn: { backgroundColor: '#A3E635', borderRadius: 999, paddingHorizontal: 32, paddingVertical: 16, marginTop: 8 },
  retryBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },

  // AI Results
  aiResultsScroll: { paddingHorizontal: 24, paddingTop: 24 },
  calorieCard: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  calorieProgressCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 6,
    borderColor: '#E5E7EB',
    borderTopColor: '#A3E635',
    borderLeftColor: '#A3E635',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  calorieValueText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#000',
    lineHeight: 38,
    padding: 0,
    margin: 0,
    textAlign: 'center',
  },
  calorieLabelText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  macroCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  macroProgressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  macroValueText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    marginTop: 2,
    padding: 0,
    margin: 0,
    textAlign: 'center',
  },
  macroLabelText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 1,
  },
  summaryCard: {
    backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB',
    padding: 20, marginBottom: 16, gap: 8,
  },
  tipsCard: {
    backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB',
    padding: 20, marginBottom: 24, gap: 12,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#000' },
  summaryText: { fontSize: 14, color: '#6B7280', lineHeight: 22 },
  tipRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  tipText: { fontSize: 14, color: '#374151', lineHeight: 20, flex: 1 },
  signUpBtn: {
    backgroundColor: '#A3E635', borderRadius: 999, height: 62,
    alignItems: 'center', justifyContent: 'center',
  },
  signUpBtnText: { fontSize: 18, fontWeight: '800', color: '#000' },
});

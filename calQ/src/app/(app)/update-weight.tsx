import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { ArrowLeft } from 'lucide-react-native';
import { RulerPicker } from 'react-native-ruler-picker';
import { updateWeight } from '../../lib/api';
import { useOnboardingProfile } from '../../hooks/useOnboardingProfile';

export default function UpdateWeightScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { profile, refetch, loading: profileLoading } = useOnboardingProfile();
  
  const [currentWeight, setCurrentWeight] = useState<number>(70); // default fallback
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.weight) {
      setCurrentWeight(parseFloat(profile.weight));
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      await updateWeight(token, currentWeight);
      await refetch();
      
      router.back();
    } catch (error) {
      console.error('Failed to update weight:', error);
      Alert.alert('Error', 'Could not save weight. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Weight</Text>
        <View style={{ width: 44 }} /> {/* Spacer */}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>What is your current weight?</Text>
        <Text style={styles.subtitle}>Track your progress over time.</Text>

        <View style={styles.weightDisplay}>
          <Text style={styles.weightValue}>{currentWeight}</Text>
          <Text style={styles.weightUnit}>kg</Text>
        </View>

        <View style={styles.rulerContainer}>
          <RulerPicker
            min={30}
            max={200}
            step={0.5}
            fractionDigits={1}
            initialValue={currentWeight}
            onValueChange={(value) => setCurrentWeight(parseFloat(value))}
            onValueChangeEnd={(value) => setCurrentWeight(parseFloat(value))}
            unit="kg"
            indicatorColor="#A3E635"
            stepWidth={2}
            longStepColor="#9CA3AF"
            shortStepColor="#D1D5DB"
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveBtn, isSaving && { opacity: 0.7 }]} 
          onPress={handleSave} 
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.saveBtnText}>Update Weight</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 60,
  },
  weightDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 40,
  },
  weightValue: {
    fontSize: 64,
    fontWeight: '800',
    color: '#A3E635',
  },
  weightUnit: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6B7280',
    marginLeft: 8,
  },
  rulerContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  saveBtn: {
    backgroundColor: '#A3E635',
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
    shadowColor: '#A3E635',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
});

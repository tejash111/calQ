import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useOnboardingProfile } from '../../hooks/useOnboardingProfile';
import { saveOnboarding } from '../../lib/api';

export default function PersonalDetailsScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { profile, loading: profileLoading } = useOnboardingProfile();

  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setCalories(profile.daily_calories?.toString() || '');
      setProtein(profile.protein_g?.toString() || '');
      setCarbs(profile.carbs_g?.toString() || '');
      setFat(profile.fat_g?.toString() || '');
    }
  }, [profile]);

  const handleSave = async () => {
    const calNum = parseInt(calories, 10);
    const proNum = parseInt(protein, 10);
    const carbNum = parseInt(carbs, 10);
    const fatNum = parseInt(fat, 10);

    if (isNaN(calNum) || calNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number for Daily Calories.');
      return;
    }
    if (isNaN(proNum) || proNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number for Daily Protein.');
      return;
    }
    if (isNaN(carbNum) || carbNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number for Daily Carbohydrates.');
      return;
    }
    if (isNaN(fatNum) || fatNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number for Daily Fat.');
      return;
    }

    try {
      setSaving(true);
      const token = await getToken();
      if (!token) throw new Error('No auth token');

      await saveOnboarding(token, {
        daily_calories: calNum,
        protein_g: proNum,
        carbs_g: carbNum,
        fat_g: fatNum,
      });

      Alert.alert('Success', 'Your personal details have been updated.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#A3E635" />
      </View>
    );
  }

  const InputField = ({ label, value, onChangeText, unit, placeholder }: any) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
        />
        <Text style={styles.unitText}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.cardTitle}>Daily Nutrition Goals</Text>
          
          <View style={styles.card}>
            <InputField
              label="Daily Calories Goal"
              value={calories}
              onChangeText={setCalories}
              unit="kcal"
              placeholder="e.g. 2000"
            />
            <View style={styles.divider} />
            <InputField
              label="Daily Protein Goal"
              value={protein}
              onChangeText={setProtein}
              unit="g"
              placeholder="e.g. 150"
            />
            <View style={styles.divider} />
            <InputField
              label="Daily Carbohydrates Goal"
              value={carbs}
              onChangeText={setCarbs}
              unit="g"
              placeholder="e.g. 250"
            />
            <View style={styles.divider} />
            <InputField
              label="Daily Fat Goal"
              value={fat}
              onChangeText={setFat}
              unit="g"
              placeholder="e.g. 60"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Save size={20} color="#000" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingTop: 60, // Account for safe area roughly
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  content: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  unitText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  saveButton: {
    backgroundColor: '#A3E635',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from '@/components/ui/text';

const { width } = Dimensions.get('window');

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index === currentStep - 1;
        const isPast = index < currentStep - 1;
        return (
          <View
            key={index}
            style={[
              styles.segment,
              isActive && styles.activeSegment,
              isPast && styles.pastSegment,
              !isActive && !isPast && styles.inactiveSegment,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  segment: {
    height: 6,
    borderRadius: 3,
  },
  activeSegment: {
    flex: 2,
    backgroundColor: '#A3E635',
  },
  pastSegment: {
    flex: 1,
    backgroundColor: '#A3E635',
    opacity: 0.4,
  },
  inactiveSegment: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
});

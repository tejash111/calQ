import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { ChevronsRight, Check } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const BUTTON_WIDTH = width - 48; // padding horizontal 24
const BUTTON_HEIGHT = 56;
const SWIPEABLE_DIMENSIONS = 46;
const H_WAVE_RANGE = BUTTON_WIDTH - SWIPEABLE_DIMENSIONS - 12;

interface SwipeButtonProps {
  onComplete: () => void;
}

export function SwipeButton({ onComplete }: SwipeButtonProps) {
  const X = useSharedValue(0);
  const isComplete = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      let newValue = e.translationX;
      
      if (isComplete.value) {
        newValue = H_WAVE_RANGE + e.translationX;
      }
      if (newValue >= 0 && newValue <= H_WAVE_RANGE) {
        X.value = newValue;
      }
    })
    .onEnd(() => {
      if (X.value < BUTTON_WIDTH / 2 - SWIPEABLE_DIMENSIONS / 2) {
        X.value = withSpring(0);
        isComplete.value = false;
      } else {
        X.value = withSpring(H_WAVE_RANGE);
        isComplete.value = true;
        runOnJS(onComplete)();
      }
    });

  const animatedStyles = {
    swipeable: useAnimatedStyle(() => {
      return {
        transform: [{ translateX: X.value }],
      };
    }),
    checkIcon: useAnimatedStyle(() => {
      return {
        opacity: interpolate(X.value, [0, H_WAVE_RANGE], [0, 1], Extrapolation.CLAMP),
      };
    }),
    swipeText: useAnimatedStyle(() => {
      return {
        opacity: interpolate(X.value, [0, H_WAVE_RANGE / 2], [1, 0], Extrapolation.CLAMP),
      };
    }),
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.text, animatedStyles.swipeText]}>
        Get Started
      </Animated.Text>
      
      <View style={styles.checkContainer}>
        <Animated.View style={[styles.checkCircle, animatedStyles.checkIcon]}>
          <Check size={24} color="#000" />
        </Animated.View>
      </View>
      
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.swipeable, animatedStyles.swipeable]}>
          <ChevronsRight size={28} color="#000" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: BUTTON_HEIGHT,
    width: BUTTON_WIDTH,
    backgroundColor: '#fff',
    borderRadius: BUTTON_HEIGHT / 2,
    borderWidth: 1,
    borderColor: '#E5E7EB', // light gray border
    justifyContent: 'center',
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  text: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    zIndex: 1,
  },
  swipeable: {
    height: SWIPEABLE_DIMENSIONS,
    width: SWIPEABLE_DIMENSIONS,
    borderRadius: SWIPEABLE_DIMENSIONS / 2,
    backgroundColor: '#A3E635', // lime-400
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  checkContainer: {
    position: 'absolute',
    right: 6,
    zIndex: 2,
  },
  checkCircle: {
    height: SWIPEABLE_DIMENSIONS,
    width: SWIPEABLE_DIMENSIONS,
    borderRadius: SWIPEABLE_DIMENSIONS / 2,
    backgroundColor: '#F3F4F6', // gray-100
    justifyContent: 'center',
    alignItems: 'center',
  }
});

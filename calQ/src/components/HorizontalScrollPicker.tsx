import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';

const { width } = Dimensions.get('window');

interface HorizontalScrollPickerProps {
  values: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

const ITEM_WIDTH = 80;
const ITEM_HEIGHT = 44;

export function HorizontalScrollPicker({ values, selectedValue, onValueChange }: HorizontalScrollPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = values.indexOf(selectedValue);

  React.useEffect(() => {
    if (scrollRef.current && selectedIndex >= 0) {
      const offset = selectedIndex * ITEM_WIDTH - (width - ITEM_WIDTH) / 2 + ITEM_WIDTH / 2;
      scrollRef.current.scrollTo({ x: Math.max(0, offset), animated: false });
    }
  }, []);

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const centerX = offsetX + width / 2;
    const index = Math.round((centerX - ITEM_WIDTH / 2) / ITEM_WIDTH);
    const clamped = Math.max(0, Math.min(index, values.length - 1));
    onValueChange(values[clamped]);
    const targetOffset = clamped * ITEM_WIDTH - (width - ITEM_WIDTH) / 2 + ITEM_WIDTH / 2;
    scrollRef.current?.scrollTo({ x: Math.max(0, targetOffset), animated: true });
  };

  return (
    <View style={styles.wrapper}>
      {/* Center indicator */}
      <View style={styles.centerLine} />
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumEnd}
        contentContainerStyle={{ paddingHorizontal: (width - ITEM_WIDTH) / 2 }}
      >
        {values.map((val) => {
          const isSelected = val === selectedValue;
          return (
            <Pressable
              key={val}
              onPress={() => onValueChange(val)}
              style={[styles.item, isSelected && styles.selectedItem]}
            >
              <Text style={[styles.itemText, isSelected && styles.selectedText]}>{val}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: ITEM_HEIGHT + 20,
    justifyContent: 'center',
    position: 'relative',
  },
  centerLine: {
    position: 'absolute',
    left: width / 2 - ITEM_WIDTH / 2 - 4,
    width: ITEM_WIDTH + 8,
    height: ITEM_HEIGHT,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    zIndex: 0,
  },
  item: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  selectedItem: {},
  itemText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  selectedText: {
    fontSize: 18,
    color: '#000',
    fontWeight: '700',
  },
});

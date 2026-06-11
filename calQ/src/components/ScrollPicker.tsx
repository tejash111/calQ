import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Text,
} from 'react-native';

const ITEM_HEIGHT = 56;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface ScrollPickerProps {
  values: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export function ScrollPicker({ values, selectedValue, onValueChange }: ScrollPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = values.indexOf(selectedValue);
  
  // Local state for smooth visual updates during active scrolling
  const [localIndex, setLocalIndex] = useState(selectedIndex >= 0 ? selectedIndex : 0);

  // Sync local index when parent prop changes
  useEffect(() => {
    const parentIndex = values.indexOf(selectedValue);
    if (parentIndex >= 0 && parentIndex !== localIndex) {
      setLocalIndex(parentIndex);
    }
  }, [selectedValue, values]);

  // Initial scroll to selected item on mount
  useEffect(() => {
    if (scrollRef.current && selectedIndex >= 0) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: selectedIndex * ITEM_HEIGHT,
          animated: false,
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, values.length - 1));
    if (clamped !== localIndex) {
      setLocalIndex(clamped);
    }
  };

  const handleScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    // If it is decelerating, let handleMomentumScrollEnd handle the snap and update
    if (!(e.nativeEvent as any).decelerating) {
      const offsetY = e.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(index, values.length - 1));
      
      // Force snapping animation programmatically
      scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
      
      if (values[clamped] !== selectedValue) {
        onValueChange(values[clamped]);
      }
    }
  };

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, values.length - 1));
    
    // Force snapping animation programmatically just in case
    scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
    
    if (values[clamped] !== selectedValue) {
      onValueChange(values[clamped]);
    }
  };

  const paddingItems = Math.floor(VISIBLE_ITEMS / 2);

  return (
    <View style={styles.container}>
      {/* Selection highlight */}
      <View style={styles.selectionHighlight} />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: paddingItems * ITEM_HEIGHT }}
      >
        {values.map((val, index) => {
          const isSelected = index === localIndex;
          return (
            <View key={val} style={styles.item}>
              <Text style={[styles.itemText, isSelected && styles.selectedText]}>
                {val}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: PICKER_HEIGHT,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  selectionHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: 8,
    right: 8,
    height: ITEM_HEIGHT,
    backgroundColor: '#E5E7EB',
    borderRadius: 14,
    zIndex: 0,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 17,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  selectedText: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '400',
  },
});

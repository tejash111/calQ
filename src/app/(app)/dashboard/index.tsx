import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#000', fontSize: 24, fontWeight: 'bold' }}>Dashboard</Text>
        <Text style={{ color: '#6B7280', marginTop: 8 }}>(Placeholder)</Text>
      </View>
    </SafeAreaView>
  );
}

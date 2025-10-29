import React from 'react';
import { View, StyleSheet } from 'react-native';
import { mockHomeResponse } from '../constants/mockData';
import { DynamicComponent } from '../components/DynamicComponent';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  // In a real app, you would fetch this from an API
  const screenData = mockHomeResponse.screen;

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <DynamicComponent component={screenData.layout} />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#953232ff',
  },
});

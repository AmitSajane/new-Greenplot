import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../../theme/tokens';
import { SectionHeader } from '../SectionHeader';
import { BrowseByCropRow } from '../BrowseByCropRow';
import { HomeCrop } from '../../../constants/farmerHomeMockData';

interface BrowseByCropSectionProps {
  crops: HomeCrop[];
  onCropPress: (crop: HomeCrop) => void;
}

export const BrowseByCropSection: React.FC<BrowseByCropSectionProps> = ({ crops, onCropPress }) => {
  return (
    <View>
      <SectionHeader title="Browse Land by Crop" />
      <View style={styles.listSpacer} />
      <BrowseByCropRow crops={crops} onCropPress={onCropPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  listSpacer: {
    height: spacing.md,
  },
});

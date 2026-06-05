import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme/tokens';
import { ownerHomeStyles as styles } from '../styles/ownerHome.styles';

export interface WorkReportCardProps {
  onPress: () => void;
}

export const WorkReportCard: React.FC<WorkReportCardProps> = ({ onPress }) => (
  <TouchableOpacity style={styles.reportCard} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.reportIconCircle}>
      <Ionicons name="document-text" size={24} color={colors.primary} />
    </View>
    <View style={styles.reportContent}>
      <Text style={styles.reportTitle}>Work Report</Text>
      <Text style={styles.reportSubtitle}>Land → Crop → Work → Labor</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
  </TouchableOpacity>
);

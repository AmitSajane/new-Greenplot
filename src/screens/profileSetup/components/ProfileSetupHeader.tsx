import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/atoms/Text';
import { colors } from '../../../theme/tokens';
import { profileSetupStyles as styles } from '../styles/profileSetup.styles';

/** Screen-local organism: static header, no logic. */
export const ProfileSetupHeader: React.FC = () => (
  <View style={styles.header}>
    <Text variant="h2" weight="bold">
      Profile Setup
    </Text>
    <Text variant="body" color={colors.textSecondary} style={{ marginTop: 4 }}>
      Complete your profile
    </Text>
  </View>
);

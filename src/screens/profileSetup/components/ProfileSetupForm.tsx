import React from 'react';
import {
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../components/atoms/Text';
import { LabeledTextInput } from '../../../components/molecules/LabeledTextInput';
import { SelectableRoleCard } from '../../../components/molecules/SelectableRoleCard';
import { colors } from '../../../theme/tokens';
import { UserRole } from '../../../types/auth';
import { profileSetupStyles as styles } from '../styles/profileSetup.styles';
import { ProfileSetupHeader } from './ProfileSetupHeader';

export interface ProfileSetupFormProps {
  name: string;
  email: string;
  role: UserRole;
  isValid: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onRoleChange: (role: UserRole) => void;
  onSubmit: () => void;
}

/**
 * Screen-local organism: layout + presentational wiring only.
 * All state and handlers come from the parent screen via props.
 */
export const ProfileSetupForm: React.FC<ProfileSetupFormProps> = ({
  name,
  email,
  role,
  isValid,
  onNameChange,
  onEmailChange,
  onRoleChange,
  onSubmit,
}) => (
  <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <ProfileSetupHeader />
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LabeledTextInput
          label="Full Name *"
          placeholder="e.g. Ramesh Kumar"
          value={name}
          onChangeText={onNameChange}
          autoCapitalize="words"
        />
        <LabeledTextInput
          label="Email (optional)"
          placeholder="email@example.com"
          value={email}
          onChangeText={onEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.roleGroup}>
          <Text variant="body" weight="600" style={styles.roleLabel}>
            I am a
          </Text>
          <View style={styles.roleRow}>
            <SelectableRoleCard
              role="farmer"
              label="Farmer"
              iconName="leaf"
              selected={role === 'farmer'}
              onPress={() => onRoleChange('farmer')}
            />
            <SelectableRoleCard
              role="owner"
              label="Owner"
              iconName="home"
              selected={role === 'owner'}
              onPress={() => onRoleChange('owner')}
            />
          </View>
        </View>
        <TouchableOpacity
          style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
          onPress={onSubmit}
          disabled={!isValid}
          activeOpacity={0.9}
        >
          {/* <Text variant="subtitle" weight="bold" color={colors.surface}>
            Continue
          </Text> */}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);

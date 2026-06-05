import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { ProfileSetupForm } from './components/ProfileSetupForm';
import { useProfileSetup } from './hooks/useProfileSetup';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileSetup'>;

/**
 * Orchestrator: connects navigation + hook (business logic) to presentational UI.
 */
export default function ProfileSetupScreen(props: Props) {
  const vm = useProfileSetup(props);

  return (
    <ProfileSetupForm
      name={vm.name}
      email={vm.email}
      role={vm.role}
      isValid={vm.isValid}
      onNameChange={vm.setName}
      onEmailChange={vm.setEmail}
      onRoleChange={vm.setRole}
      onSubmit={vm.handleComplete}
    />
  );
}

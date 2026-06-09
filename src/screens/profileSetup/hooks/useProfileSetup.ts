import { useState, useCallback, useMemo } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/AuthStack';
import { RootStackParamList } from '../../../navigation/AppNavigator';
import { useAuth } from '../../../context/AuthContext';
import { UserRole } from '../../../types/auth';
import { isValidProfileName } from '../../../utils/validation';

type ProfileSetupProps = NativeStackScreenProps<AuthStackParamList, 'ProfileSetup'>;

export interface ProfileSetupViewModel {
  name: string;
  email: string;
  role: UserRole;
  isValid: boolean;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setRole: (role: UserRole) => void;
  handleComplete: () => void;
}

/**
 * Screen-level business logic: auth, navigation, validation, form state.
 */
export function useProfileSetup({
  navigation,
  route,
}: ProfileSetupProps): ProfileSetupViewModel {
  const rootNavigation =
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const { user, completeProfile } = useAuth();

  const phoneNumber = route.params?.phoneNumber ?? user?.phoneNumber ?? '';
  const preselectedRole = route.params?.role as UserRole | undefined;
  const prefilledName =  'Amit' //route.params?.name ?? '';
  const prefilledEmail = route.params?.email ?? '';

  const [name, setName] = useState(user?.name ?? prefilledName);
  const [email, setEmail] = useState(user?.email ?? prefilledEmail);
  const [role, setRole] = useState<UserRole>(
    preselectedRole ?? user?.role ?? 'farmer'
  );

  const isValid = useMemo(() => isValidProfileName(name), [name]);

  const handleComplete = useCallback(() => {
    if (!isValidProfileName(name)) return;
    completeProfile(phoneNumber, name.trim(), role, email.trim() || undefined);
    rootNavigation?.replace('Main');
  }, [completeProfile, phoneNumber, name, role, email, rootNavigation]);

  return {
    name,
    email,
    role,
    isValid,
    setName,
    setEmail,
    setRole,
    handleComplete,
  };
}

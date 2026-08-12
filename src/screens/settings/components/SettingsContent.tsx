import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/tokens';
import { SettingsViewModel } from '../hooks/useSettings';
import { settingsStyles as styles } from '../styles/settings.styles';
import { ScreenHeader } from '../../../components/molecules/ScreenHeader';

type PreferenceItem =
  | { icon: string; label: string; url: string }
  | { icon: string; label: string; document: 'privacy' | 'terms' }
  | { icon: string; label: string; route: 'editProfile' }
  | { icon: string; label: string };

const PREFERENCE_ITEMS: PreferenceItem[] = [
  { icon: 'notifications', label: 'Notifications' },
  { icon: 'help', label: 'Help & Support' },
  { icon: 'edit', label: 'Edit profile', route: 'editProfile' },
  { icon: 'privacy-tip', label: 'Privacy policy', document: 'privacy' },
  { icon: 'gavel', label: 'Terms & Conditions', document: 'terms' },
  { icon: 'description', label: 'Consent logs' },
];

export const SettingsContent: React.FC<SettingsViewModel> = ({
  user,
  onLogout,
  onLanguagePress,
  onWebsitePress,
  onLegalPress,
  onEditProfilePress,
  onBack,
}) => (
  <SafeAreaView style={styles.safeArea}>
    <ScreenHeader title="Settings" onBack={onBack} titleSize={20} />
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="person" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Account</Text>
        </View>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{user?.name || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{user?.phoneNumber || 'N/A'}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Role</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user?.role === 'farmer' ? '👨‍🌾 Farmer' : '🏠 Owner'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="settings" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Preferences</Text>
        </View>
        {PREFERENCE_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.settingItem}
            activeOpacity={0.7}
            onPress={
              'url' in item
                ? () => onWebsitePress(item.label, item.url)
                : 'document' in item
                  ? () => onLegalPress(item.document)
                  : 'route' in item
                    ? onEditProfilePress
                    : undefined
            }
          >
            <Icon name={item.icon} size={24} color={colors.textSecondary} />
            <Text style={styles.settingText}>{item.label}</Text>
            <Icon name="chevron-right" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.settingItem} activeOpacity={0.7} onPress={onLanguagePress}>
          <Icon name="language" size={24} color={colors.textSecondary} />
          <Text style={styles.settingText}>Language</Text>
          <Icon name="chevron-right" size={24} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.8}>
        <Icon name="logout" size={24} color={colors.surface} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  </SafeAreaView>
);

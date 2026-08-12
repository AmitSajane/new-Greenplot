import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/molecules/ScreenHeader';
import type { SettingsStackParamList } from '../../navigation/SettingsStack';
import { LEGAL_CONTENT, LEGAL_VERSION } from '../../constants/legalContent';
import { colors, radius, shadow, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<SettingsStackParamList, 'LegalDocument'>;

// Read-only viewer — acceptance itself now happens once, during registration
// (see ProfileOnboardingScreen), so this screen is just for looking the
// document up again later, not a second consent gate.
export default function LegalDocumentScreen({ navigation, route }: Props) {
  const { document } = route.params;
  const content = LEGAL_CONTENT[document];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title={content.title} onBack={() => navigation.goBack()} titleSize={20} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Effective date: 12 August 2026 · Version {LEGAL_VERSION}</Text>
        <View style={styles.documentCard}>
          {content.sections.map(section => (
            <View key={section.heading} style={styles.section}>
              <Text style={styles.heading}>{section.heading}</Text>
              <Text style={styles.body}>{section.body}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  updated: { color: colors.textSecondary, fontSize: 12, marginBottom: spacing.md },
  documentCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  section: { marginBottom: spacing.lg },
  heading: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm },
  body: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
});

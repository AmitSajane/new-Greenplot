import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { ScreenHeader } from '../../components/molecules/ScreenHeader';
import type { SettingsStackParamList } from '../../navigation/SettingsStack';
import { colors, spacing } from '../../theme/tokens';

type Props = NativeStackScreenProps<SettingsStackParamList, 'SettingsWebView'>;

export default function SettingsWebViewScreen({ navigation, route }: Props) {
  const { title, url } = route.params;
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title={title} onBack={() => navigation.goBack()} titleSize={20} />
      <View style={styles.content}>
        {failed ? (
          <View style={styles.center}>
            <Text style={styles.errorTitle}>Unable to load this page</Text>
            <Text style={styles.errorText}>Please check your internet connection and try again.</Text>
          </View>
        ) : (
          <>
            <WebView
              source={{ uri: url }}
              onLoadEnd={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setFailed(true);
              }}
              startInLoadingState={false}
              allowsBackForwardNavigationGestures
              style={styles.webView}
            />
            {loading && (
              <View style={styles.loading} pointerEvents="none">
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading…</Text>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1 },
  webView: { flex: 1 },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  loadingText: { color: colors.textSecondary, fontSize: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

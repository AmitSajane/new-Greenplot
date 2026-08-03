import React from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../atoms/Text';
import { colors } from '../../theme/tokens';

interface AuthLayoutProps {
  headlineTop: string;
  headlineMain: string;
  children: React.ReactNode;
  headerMarginTop?: number;
  headerMarginBottom?: number;
  brandImageHeight?: number;
  containerPaddingBottom?: number;
}

/** Shared headline + brand image + form-card shell for Login/Register/Otp. Each screen keeps its own fields/logic as children — only the surrounding chrome (identical across all three) lives here. */
export function AuthLayout({
  headlineTop,
  headlineMain,
  children,
  headerMarginTop = 100,
  headerMarginBottom = 56,
  brandImageHeight = 90,
  containerPaddingBottom = 24,
}: AuthLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView
          style={[styles.container, { paddingBottom: containerPaddingBottom }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.headerBlock, { marginTop: headerMarginTop, marginBottom: headerMarginBottom }]}>
            <Text style={styles.headlineTop}>{headlineTop}</Text>
            <Text style={styles.headlineMain}>{headlineMain}</Text>
            <Image
              source={require('../../assets/images/green-plot.png')}
              style={[styles.brandImage, { height: brandImageHeight }]}
            />
          </View>

          <View style={styles.formCard}>{children}</View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.authGreen.background },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
    backgroundColor: colors.authGreen.background,
  },
  headerBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headlineTop: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.authGreen.headline,
    letterSpacing: 1,
  },
  headlineMain: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.authGreen.headline,
    marginTop: 4,
    letterSpacing: 2,
  },
  brandImage: {
    resizeMode: 'contain',
    marginTop: 10,
  },
  formCard: {
    flex: 1,
  },
});

import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { spacing } from '../../theme/tokens';

const HOME_GRADIENT = ['#092E18', '#0F4A28', '#1A6B3A'];

export type AppHeaderVariant = 'home' | 'default';

export interface AppHeaderStyleProps {
  container?: StyleProp<ViewStyle>;
  title?: StyleProp<TextStyle>;
  subtitle?: StyleProp<TextStyle>;
}

export interface AppHeaderAssetProps {
  /** Ionicons name for the left icon in the default variant. */
  profileIcon?: string;
  backIcon?: string;
  notificationIcon?: string;
  /** Gradient stops for the home variant. */
  gradientColors?: string[];
}

export interface AppHeaderData {
  variant: AppHeaderVariant;
  /** default variant */
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  hasNotificationDot?: boolean;
  languageShort?: string;
  /** home variant */
  name?: string;
  location?: string | null;
  loading?: boolean;
}

export interface AppHeaderHandler {
  onProfilePress?: () => void;
  onBackPress?: () => void;
  onLanguagePress?: () => void;
  onNotificationPress?: () => void;
}

export interface AppHeaderProps {
  style?: AppHeaderStyleProps;
  asset?: AppHeaderAssetProps;
  data: AppHeaderData;
  handler?: AppHeaderHandler;
  /** Extra content rendered inside the home variant's gradient, below the avatar/greeting row. */
  children?: React.ReactNode;
}

function toInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function HomeHeader({ style, asset, data, handler, children }: Required<Pick<AppHeaderProps, 'data'>> & AppHeaderProps) {
  const gradientColors = asset?.gradientColors || HOME_GRADIENT;
  return (
    <LinearGradient colors={HOME_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <SafeAreaView edges={['top']}>
        <View style={[homeStyles.header, style?.container]}>
          <View style={homeStyles.headerRow}>
            <TouchableOpacity
              style={homeStyles.avatar}
              onPress={handler?.onProfilePress}
              activeOpacity={0.8}
              hitSlop={6}
            >
              <Text style={homeStyles.avatarText}>{toInitials(data.name || '')}</Text>
            </TouchableOpacity>
            <View>
              <Text style={homeStyles.hi}>Namaste 🙏</Text>
              <Text style={[homeStyles.name, style?.title]}>{data.name}</Text>
              <View style={homeStyles.locRow}>
                <Ionicons name="location" size={11} color="rgba(255,255,255,0.55)" />
                <Text style={homeStyles.locText}>{data.location}</Text>
                {data.loading ? (
                  <ActivityIndicator style={{ marginLeft: 8 }} size="small" color="rgba(255,255,255,0.9)" />
                ) : null}
              </View>
            </View>
            <View style={homeStyles.headerActions}>
              <TouchableOpacity
                style={homeStyles.headerBtn}
                onPress={handler?.onLanguagePress}
                activeOpacity={0.8}
                hitSlop={6}
              >
                <Text style={homeStyles.langText}>{data.languageShort || 'EN'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={homeStyles.headerBtn}
                onPress={handler?.onNotificationPress}
                activeOpacity={0.8}
                hitSlop={6}
              >
                <Ionicons name={asset?.notificationIcon || 'notifications'} size={17} color="#fff" />
                <View style={homeStyles.bellDot} />
              </TouchableOpacity>
            </View>
          </View>
          {children}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function DefaultHeader({ style, asset, data, handler }: Required<Pick<AppHeaderProps, 'data'>> & AppHeaderProps) {
   const gradientColors = asset?.gradientColors || HOME_GRADIENT;
  return (
   <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <SafeAreaView edges={['top']}>
        <View style={[defaultStyles.row, style?.container]}>
          {data.showBack ? (
            <TouchableOpacity
              style={defaultStyles.iconBtn}
              onPress={handler?.onBackPress}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Ionicons name={asset?.backIcon || 'arrow-back'} size={22} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={data.name ? defaultStyles.avatarBtn : defaultStyles.iconBtn}
              onPress={handler?.onProfilePress}
              activeOpacity={0.7}
              hitSlop={8}
            >
              {data.name ? (
                <Text style={defaultStyles.avatarText}>{toInitials(data.name)}</Text>
              ) : (
                <Ionicons name={asset?.profileIcon || 'person-circle-outline'} size={26} color="#fff" />
              )}
            </TouchableOpacity>
          )}
          <View style={defaultStyles.titleWrap}>
            <Text style={[defaultStyles.title, style?.title]} numberOfLines={1}>
              {data.title}
            </Text>
            {data.subtitle ? (
              <Text style={[defaultStyles.subtitle, style?.subtitle]} numberOfLines={1}>
                {data.subtitle}
              </Text>
            ) : null}
          </View>
          <View style={defaultStyles.actions}>
            <TouchableOpacity
              style={defaultStyles.langBtn}
              onPress={handler?.onLanguagePress}
              activeOpacity={0.7}
              hitSlop={6}
            >
              <Text style={defaultStyles.langText}>{data.languageShort || 'EN'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={defaultStyles.iconBtn}
              onPress={handler?.onNotificationPress}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Ionicons name={asset?.notificationIcon || 'notifications-outline'} size={22} color="#fff" />
              {data.hasNotificationDot ? <View style={defaultStyles.bellDot} /> : null}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function AppHeaderBase(props: AppHeaderProps) {
  if (props.data.variant === 'home') return <HomeHeader {...props} />;
  return <DefaultHeader {...props} />;
}

/**
 * Shared, presentation-only header used across the app's tab screens.
 * Everything is driven by props — no navigation/context reads inside —
 * so every screen decides its own title, icons, and press handlers.
 */
export const AppHeader = React.memo(AppHeaderBase);

const homeStyles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F5C86A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#5C3300', fontWeight: '800', fontSize: 15 },
  hi: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  name: { fontSize: 19, fontWeight: '800', color: '#fff', lineHeight: 23 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 1 },
  locText: { fontSize: 10, color: 'rgba(255,255,255,0.55)' },
  headerActions: { marginLeft: 'auto', flexDirection: 'row', gap: 7 },
  headerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: { fontSize: 12, color: '#fff', fontWeight: '800' },
  bellDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF5A5A',
  },
});

const defaultStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: { flex: 1 },
  title: { fontSize: 17, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  langBtn: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 6,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  avatarBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5C86A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#5C3300', fontWeight: '800', fontSize: 13 },
  bellDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF5A5A',
  },
});

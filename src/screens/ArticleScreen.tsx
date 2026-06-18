/**
 * In-app article reader. Opens a news/scheme URL inside a WebView with a
 * branded header (back + open-in-browser) and loading/error states, so users
 * never leave the app to read the full story.
 */
import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FarmerHomeStackParamList } from '../navigation/FarmerHomeStack';

type ArticleRoute = RouteProp<FarmerHomeStackParamList, 'Article'>;

export default function ArticleScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<ArticleRoute>();
  const { url, title } = params;

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const onBack = useCallback(() => navigation.goBack(), [navigation]);
  const onOpenExternal = useCallback(() => {
    Linking.openURL(url).catch(() => {});
  }, [url]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Branded header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#0F4A28" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {title || 'Article'}
        </Text>
        <TouchableOpacity style={styles.iconBtn} onPress={onOpenExternal} activeOpacity={0.7}>
          <Ionicons name="open-outline" size={20} color="#0F4A28" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.body}>
        {failed ? (
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={48} color="#9EB8A8" />
            <Text style={styles.errText}>Couldn't load this article.</Text>
            <TouchableOpacity style={styles.errBtn} onPress={onOpenExternal} activeOpacity={0.85}>
              <Text style={styles.errBtnText}>Open in browser</Text>
            </TouchableOpacity>
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
              startInLoadingState
              allowsBackForwardNavigationGestures
              style={styles.webview}
            />
            {loading && (
              <View style={styles.center} pointerEvents="none">
                <ActivityIndicator size="large" color="#1A6B3A" />
                <Text style={styles.loadingText}>Loading article…</Text>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E6EFE9',
    backgroundColor: '#fff',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, fontSize: 16, fontWeight: '800', color: '#0D1509', marginHorizontal: 4 },
  body: { flex: 1 },
  webview: { flex: 1 },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 12,
  },
  loadingText: { fontSize: 14, color: '#6B8074', fontWeight: '600' },
  errText: { fontSize: 16, color: '#3A5040', fontWeight: '700' },
  errBtn: {
    backgroundColor: '#1A6B3A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  errBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

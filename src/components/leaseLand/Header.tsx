import React from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, spacing } from '../../theme/tokens';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface HeaderProps {
  onProfilePress?: () => void;
  onAddPostPress?: () => void;
}

const DEFAULT_BACKGROUND_IMAGE =
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=300&fit=crop';
const DEFAULT_PROFILE_IMAGE =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop';

export function Header({ onProfilePress, onAddPostPress }: HeaderProps) {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={{ uri: DEFAULT_BACKGROUND_IMAGE }}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onAddPostPress}
            activeOpacity={0.8}
            style={styles.addPostButton}
          >
            <Text style={styles.addPostText}>Add Free Post</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: 200,
    justifyContent: 'flex-start',
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: radius.md,
  },
  backIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  addPostButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  addPostText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 14,
  },
});


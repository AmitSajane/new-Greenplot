import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../../theme/tokens';

const TOPICS = ['Crop Issues', 'Market', 'Tech', 'Tips'] as const;
type Topic = (typeof TOPICS)[number];

type Props = {
  onSubmitSuccess?: () => void;
};

function CreatePostFormComponent({ onSubmitSuccess }: Props) {
  const [selectedTopic, setSelectedTopic] = useState<Topic>('Crop Issues');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Add details', 'Please add a title and description.');
      return;
    }

    // In a real app this would call an API.
    Alert.alert('Post submitted', 'Your question has been posted to the community.');
    setTitle('');
    setDescription('');
    setIsAnonymous(false);
    setSelectedTopic('Crop Issues');
    if (onSubmitSuccess) {
      onSubmitSuccess();
    }
  }, [description, onSubmitSuccess, title]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Select Topic</Text>
        <View style={styles.topicRow}>
          {TOPICS.map((topic) => {
            const isActive = topic === selectedTopic;
            return (
              <TouchableOpacity
                key={topic}
                activeOpacity={0.85}
                style={[styles.topicChip, isActive && styles.topicChipActive]}
                onPress={() => setSelectedTopic(topic)}
              >
                <Text
                  style={[styles.topicChipText, isActive && styles.topicChipTextActive]}
                >
                  {topic}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, styles.labelSpacing]}>Question Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Yellow spots on wheat leaves..."
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={[styles.label, styles.labelSpacing]}>Description</Text>
        <View style={styles.descriptionWrapper}>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe your problem in detail or share your story..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity activeOpacity={0.8} style={styles.micButton}>
            <Ionicons name="mic" size={20} color={colors.primaryDark} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, styles.labelSpacing]}>Add Photo or Video</Text>
        <View style={styles.attachRow}>
          <TouchableOpacity activeOpacity={0.85} style={styles.attachCard}>
            <Ionicons name="camera" size={24} color={colors.primaryDark} />
            <Text style={styles.attachLabel}>Camera</Text>
          </TouchableOpacity>
          <View style={styles.attachSpacer} />
          <TouchableOpacity activeOpacity={0.85} style={styles.attachCard}>
            <Ionicons name="images" size={24} color={colors.primaryDark} />
            <Text style={styles.attachLabel}>Gallery</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.anonymousRow}>
          <View>
            <Text style={styles.anonymousTitle}>Post Anonymously</Text>
            <Text style={styles.anonymousSubtitle}>Hide your name from others</Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            thumbColor={isAnonymous ? colors.surface : '#f4f3f4'}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            By posting, you agree to our{' '}
            <Text style={styles.link}>Community Guidelines</Text>. Please be
            respectful to other farmers.
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>Submit Post ▸</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export const CreatePostForm = React.memo(CreatePostFormComponent);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  labelSpacing: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  topicRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  topicChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  topicChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  topicChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  topicChipTextActive: {
    color: colors.surface,
  },
  input: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadow.card,
  },
  descriptionWrapper: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
    padding: spacing.lg,
  },
  descriptionInput: {
    minHeight: 120,
    fontSize: 14,
    color: colors.textPrimary,
  },
  micButton: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  attachCard: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  attachSpacer: {
    width: spacing.lg,
  },
  attachLabel: {
    marginTop: spacing.sm,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  anonymousRow: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  anonymousTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  anonymousSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoBox: {
    marginTop: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: spacing.xxl,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    ...shadow.card,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.surface,
  },
});



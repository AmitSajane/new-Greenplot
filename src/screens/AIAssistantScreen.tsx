import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius, shadow, spacing } from '../theme/tokens';
import { ChatMessage, generateAssistantReply } from '../services/aiAssistantService';

// Optional dependency; we’ll keep the UI working even if not installed yet.
let ImagePicker: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ImagePicker = require('react-native-image-picker');
} catch (e) {
  ImagePicker = null;
}

type Suggestion = { id: string; text: string };

const BOT_AVATAR = '🤖';
const USER_AVATAR = '🧑‍🌾';

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function buildInitialMessages(): ChatMessage[] {
  return [
    {
      id: makeId('m'),
      role: 'assistant',
      text: "Hello! I'm your AI farming assistant. How can I help you today?",
      createdAt: Date.now(),
    },
  ];
}

export default function AIAssistantScreen({ navigation }: any) {
  const [messages, setMessages] = useState<ChatMessage[]>(buildInitialMessages);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(() => [
    { id: makeId('s'), text: 'Best time to harvest tomatoes?' },
    { id: makeId('s'), text: 'How often should I irrigate?' },
    { id: makeId('s'), text: 'How to prevent leaf blight?' },
  ]);

  const listRef = useRef<FlatList<ChatMessage> | null>(null);

  const data = useMemo(() => {
    // FlatList inverted expects newest first
    return [...messages].sort((a, b) => b.createdAt - a.createdAt);
  }, [messages]);

  const scrollToTop = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  }, []);

  const pushMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const replaceSuggestions = useCallback((texts: string[]) => {
    setSuggestions(texts.slice(0, 4).map((t) => ({ id: makeId('s'), text: t })));
  }, []);

  const respond = useCallback(
    async (args: { userText?: string; imageUri?: string }) => {
      setIsThinking(true);
      try {
        const reply = generateAssistantReply({
          userText: args.userText,
          imageUri: args.imageUri,
          history: messages,
        });

        // Simulate small processing delay for UX
        await new Promise((r) => setTimeout(r, 350));

        pushMessage({
          id: makeId('m'),
          role: 'assistant',
          text: reply.text,
          createdAt: Date.now(),
        });
        replaceSuggestions(reply.suggestions);
        scrollToTop();
      } finally {
        setIsThinking(false);
      }
    },
    [messages, pushMessage, replaceSuggestions, scrollToTop]
  );

  const handleSendText = useCallback(() => {
    const text = input.trim();
    if (!text || isThinking) return;
    setInput('');
    pushMessage({
      id: makeId('m'),
      role: 'user',
      text,
      createdAt: Date.now(),
    });
    scrollToTop();
    void respond({ userText: text });
  }, [input, isThinking, pushMessage, respond, scrollToTop]);

  const handleSuggestionPress = useCallback(
    (text: string) => {
      if (isThinking) return;
      pushMessage({
        id: makeId('m'),
        role: 'user',
        text,
        createdAt: Date.now(),
      });
      scrollToTop();
      void respond({ userText: text });
    },
    [isThinking, pushMessage, respond, scrollToTop]
  );

  const handlePickImage = useCallback(() => {
    if (!ImagePicker?.launchImageLibrary) {
      Alert.alert(
        'Image upload not available',
        'Please install react-native-image-picker to enable image sending.'
      );
      return;
    }

    ImagePicker.launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 1, quality: 0.8 },
      (res: any) => {
        if (res?.didCancel) return;
        const asset = res?.assets?.[0];
        const uri = asset?.uri;
        if (!uri) return;

        if (isThinking) return;

        pushMessage({
          id: makeId('m'),
          role: 'user',
          imageUri: uri,
          text: input.trim() ? input.trim() : undefined,
          createdAt: Date.now(),
        });
        setInput('');
        scrollToTop();
        void respond({ userText: input.trim() || undefined, imageUri: uri });
      }
    );
  }, [input, isThinking, pushMessage, respond, scrollToTop]);

  const renderItem = useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.row, isUser ? styles.rowUser : styles.rowBot]}>
        <View style={[styles.avatar, isUser ? styles.avatarUser : styles.avatarBot]}>
          <Text style={styles.avatarText}>{isUser ? USER_AVATAR : BOT_AVATAR}</Text>
        </View>

        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.botBubble,
            shadow.card,
          ]}
        >
          {!!item.imageUri && (
            <Image source={{ uri: item.imageUri }} style={styles.image} resizeMode="cover" />
          )}
          {!!item.text && (
            <Text style={[styles.bubbleText, isUser ? styles.userText : styles.botText]}>
              {item.text}
            </Text>
          )}
        </View>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Assistant</Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <FlatList
          ref={(r) => (listRef.current = r)}
          data={data}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          inverted
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Suggestions */}
        <View style={styles.suggestionsWrap}>
          <FlatList
            data={suggestions}
            keyExtractor={(s) => s.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionChip}
                activeOpacity={0.85}
                onPress={() => handleSuggestionPress(item.text)}
                disabled={isThinking}
              >
                <Text style={styles.suggestionText}>{item.text}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Input */}
        <View style={styles.inputBar}>
          <TouchableOpacity
            onPress={handlePickImage}
            style={styles.iconBtn}
            hitSlop={10}
            disabled={isThinking}
          >
            <Ionicons name="image-outline" size={22} color={colors.info} />
          </TouchableOpacity>

          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask me anything about farming..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            multiline
            editable={!isThinking}
            returnKeyType="send"
            onSubmitEditing={handleSendText}
          />

          <TouchableOpacity
            onPress={handleSendText}
            style={[styles.sendBtn, isThinking ? styles.sendBtnDisabled : null]}
            activeOpacity={0.85}
            disabled={isThinking}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {isThinking && (
          <View style={styles.thinkingRow}>
            <Text style={styles.thinkingText}>Assistant is typing…</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  rowUser: { justifyContent: 'flex-end' },
  rowBot: { justifyContent: 'flex-start' },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarUser: { backgroundColor: colors.softGreen, marginLeft: spacing.sm, marginRight: 0 },
  avatarBot: { backgroundColor: colors.softBlue },
  avatarText: { fontSize: 16 },
  bubble: {
    maxWidth: '78%',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 6,
  },
  botBubble: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 6,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: { color: '#fff' },
  botText: { color: colors.textPrimary },
  image: {
    width: 220,
    height: 160,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.border,
  },
  suggestionsWrap: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  suggestionsContent: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  suggestionChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#B7E4C7',
    backgroundColor: '#EAF7EE',
  },
  suggestionText: {
    color: colors.primaryDark,
    fontWeight: '600',
    fontSize: 14,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    backgroundColor: colors.background,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  thinkingRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  thinkingText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});


import React, { useCallback, useMemo, useRef } from 'react';
import { FlatList, KeyboardAvoidingView, ListRenderItemInfo, Platform, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChatMessage } from '../services/aiAssistantService';
import { useKisanMitra } from './aiAssistant/useKisanMitra';
import { LANGUAGES, QUICK_STARTS } from './aiAssistant/constants';
import { km } from './aiAssistant/kisanMitra.styles';
import {
  ChatHeader,
  FollowUpChips,
  InputBar,
  LanguagePicker,
  MessageBubble,
  TypingIndicator,
  WelcomeState,
} from './aiAssistant/components';
import { MediaSourceSheet } from './hub/components/community/MediaSourceSheet';
import { PHOTO_SOURCES } from './hub/constants/mediaSources';

export default function AIAssistantScreen() {
  const navigation = useNavigation<{ goBack: () => void }>();
  const vm = useKisanMitra();
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const languageLabel = useMemo(
    () => LANGUAGES.find(l => l.code === vm.language)?.label ?? 'English',
    [vm.language],
  );

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChatMessage>) => (
      <MessageBubble
        message={item}
        ui={vm.ui}
        onAction={vm.onAction}
        onToggleTranslate={vm.toggleTranslate}
        onFeedback={vm.setFeedback}
        onReadAloud={vm.readAloud}
        onRegenerate={vm.regenerate}
        isSpeaking={vm.speakingMessageId === item.id}
      />
    ),
    [vm.ui, vm.onAction, vm.toggleTranslate, vm.setFeedback, vm.readAloud, vm.regenerate, vm.speakingMessageId],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <View style={km.safe}>
      <ChatHeader
        statusText={
          vm.isSpeaking ? vm.ui.speaking : vm.isListening ? vm.ui.listening : vm.isThinking ? vm.ui.typing : vm.ui.online
        }
        languageLabel={languageLabel}
        onBack={() => navigation.goBack()}
        onLangPress={vm.openLangPicker}
      />

      <KeyboardAvoidingView style={km.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {vm.showWelcome ? (
          <ScrollView contentContainerStyle={km.chatContent} keyboardShouldPersistTaps="handled">
            <WelcomeState
              ui={vm.ui}
              quickStarts={QUICK_STARTS}
              language={vm.language}
              onQuickStart={vm.sendText}
              onVoice={vm.onMic}
            />
          </ScrollView>
        ) : (
          <FlatList
            ref={listRef}
            data={vm.messages}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={km.chatContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={scrollToEnd}
            ListFooterComponent={vm.isThinking ? <TypingIndicator /> : null}
            initialNumToRender={10}
            removeClippedSubviews
          />
        )}

        {!vm.showWelcome && (
          <FollowUpChips label={vm.ui.followupsLabel} suggestions={vm.suggestions} onPick={vm.sendText} />
        )}

        <InputBar
          placeholder={vm.ui.placeholder}
          listeningLabel={vm.ui.listening}
          listening={vm.isListening}
          languages={LANGUAGES}
          currentLanguage={vm.language}
          onChooseLanguage={vm.chooseLanguage}
          onSend={vm.sendText}
          onMic={vm.onMic}
          onAttach={vm.pickImage}
          disabled={vm.isThinking}
        />
      </KeyboardAvoidingView>

      <LanguagePicker
        visible={vm.langPickerOpen}
        languages={LANGUAGES}
        current={vm.language}
        title="Choose language · भाषा चुनें"
        onChoose={vm.chooseLanguage}
        onClose={vm.closeLangPicker}
      />

      <MediaSourceSheet
        visible={vm.mediaSheetOpen}
        title="Add a photo"
        subtitle="Take a new photo or choose one from your gallery"
        sources={PHOTO_SOURCES}
        onPick={vm.onPickMediaSource}
        onClose={vm.closeMediaSheet}
      />
    </View>
  );
}

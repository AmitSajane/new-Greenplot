import React, { useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { km } from '../kisanMitra.styles';
import { ActionType, ChatMessage } from '../../../services/aiAssistantService';

const WAVE = [6, 12, 18, 9, 15, 7, 13, 10, 16];
const wave = StyleSheet.create(
  WAVE.reduce((acc, h, i) => ({ ...acc, [`b${i}`]: { height: h } }), {} as Record<string, { height: number }>),
);

interface Props {
  message: ChatMessage;
  ui: { translate: string; showOriginal: string; verified: string };
  onAction: (type: ActionType) => void;
  onToggleTranslate: (id: string) => void;
  onFeedback: (id: string, value: 'up' | 'down') => void;
  onReadAloud: (text: string, english: boolean) => void;
  onRegenerate: () => void;
}

function MessageBubbleBase({ message, ui, onAction, onToggleTranslate, onFeedback, onReadAloud, onRegenerate }: Props) {
  const isBot = message.role === 'assistant';
  const id = message.id;

  const up = useCallback(() => onFeedback(id, 'up'), [onFeedback, id]);
  const down = useCallback(() => onFeedback(id, 'down'), [onFeedback, id]);
  const translate = useCallback(() => onToggleTranslate(id), [onToggleTranslate, id]);
  const speakThis = useCallback(
    () => onReadAloud(message.showEnglish ? message.textEn || message.text || '' : message.text || '', !!message.showEnglish),
    [onReadAloud, message.showEnglish, message.textEn, message.text],
  );

  // ── user message ──
  if (!isBot) {
    return (
      <View style={[km.msgRow, km.msgRowUser]}>
        <View style={[km.mAv, km.mAvUser]}>
          <Text style={km.mAvEmoji}>🧑‍🌾</Text>
        </View>
        <View style={[km.bubble, km.bubbleUser]}>
          {!!message.imageUri && <Image source={{ uri: message.imageUri }} style={km.msgImage} />}
          {message.isVoice ? (
            <View style={km.voiceMsg}>
              <View style={km.vmPlay}>
                <Ionicons name="play" size={14} color="#fff" />
              </View>
              <View style={km.vmWave}>
                {WAVE.map((_, i) => (
                  <View key={i} style={[km.vmBar, wave[`b${i}`]]} />
                ))}
              </View>
              <Text style={km.vmTime}>{message.voiceDuration}</Text>
            </View>
          ) : (
            !!message.text && <Text style={km.bubbleTextUser}>{message.text}</Text>
          )}
        </View>
      </View>
    );
  }

  // ── bot message ──
  const display = message.showEnglish ? message.textEn || message.text : message.text;
  const canTranslate = !!message.textEn && message.textEn !== message.text;

  return (
    <View>
      <View style={[km.msgRow, km.msgRowBot]}>
        <View style={[km.mAv, km.mAvBot]}>
          <Text style={km.mAvEmoji}>🌱</Text>
        </View>
        <View style={[km.bubble, km.bubbleBot]}>
          <Text style={km.bubbleTextBot}>{display}</Text>

          {!!message.actions?.length && (
            <View style={km.actions}>
              {message.actions.map(a => {
                const buy = a.type === 'buy' || a.type === 'market';
                return (
                  <TouchableOpacity
                    key={a.type + a.label}
                    style={[km.action, buy ? km.actionBuy : km.actionGhost]}
                    activeOpacity={0.85}
                    onPress={() => onAction(a.type)}
                  >
                    <Ionicons
                      name={a.type === 'buy' ? 'cart' : a.type === 'scan' ? 'camera' : a.type === 'soil' ? 'flask' : a.type === 'community' ? 'people' : 'bar-chart'}
                      size={11}
                      color={buy ? '#fff' : '#0F4A28'}
                    />
                    <Text style={buy ? km.actionTextBuy : km.actionTextGhost}>{a.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={km.bMeta}>
            <TouchableOpacity onPress={speakThis} hitSlop={6}>
              <Ionicons name="volume-medium" size={15} color="#6B8074" />
            </TouchableOpacity>
            {canTranslate && (
              <TouchableOpacity style={km.bMetaLink} onPress={translate} hitSlop={6}>
                <Ionicons name="language" size={12} color="#1A6B3A" />
                <Text style={km.bMetaLinkText}>{message.showEnglish ? ui.showOriginal : ui.translate}</Text>
              </TouchableOpacity>
            )}
            {message.verified && (
              <View style={km.verified}>
                <Ionicons name="shield-checkmark" size={10} color="#0F4A28" />
                <Text style={km.verifiedText}>{ui.verified}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={km.feedback}>
        <TouchableOpacity onPress={up} hitSlop={6}>
          <Ionicons name={message.feedback === 'up' ? 'thumbs-up' : 'thumbs-up-outline'} size={15} color={message.feedback === 'up' ? '#1A6B3A' : '#9EB8A8'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={down} hitSlop={6}>
          <Ionicons name={message.feedback === 'down' ? 'thumbs-down' : 'thumbs-down-outline'} size={15} color={message.feedback === 'down' ? '#C02828' : '#9EB8A8'} />
        </TouchableOpacity>
        <TouchableOpacity style={km.feedbackReg} onPress={onRegenerate} hitSlop={6}>
          <Ionicons name="refresh" size={12} color="#6B8074" />
          <Text style={km.feedbackRegText}>Regenerate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const MessageBubble = React.memo(MessageBubbleBase);

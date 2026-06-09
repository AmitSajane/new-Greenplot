import React from 'react';
import { View } from 'react-native';
import { km } from '../kisanMitra.styles';

/** Three-dot "typing…" bubble (staggered opacity, no timers → leak-free). */
export const TypingIndicator = React.memo(() => (
  <View style={km.typing}>
    <View style={km.typingDot} />
    <View style={[km.typingDot, km.typingDotMid]} />
    <View style={[km.typingDot, km.typingDotLow]} />
  </View>
));

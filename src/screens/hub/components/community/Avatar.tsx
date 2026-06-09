import React from 'react';
import { Text, View } from 'react-native';
import { hubStyles as s, avatarTones } from '../../styles/hub.styles';
import { AvatarTone } from '../../constants/communityData';

/** Circular initials avatar, tinted by tone. */
export const Avatar = React.memo(({ initials, tone }: { initials: string; tone: AvatarTone }) => {
  const c = avatarTones[tone];
  return (
    <View style={[s.av, { backgroundColor: c.bg }]}>
      <Text style={[s.avText, { color: c.fg }]}>{initials}</Text>
    </View>
  );
});

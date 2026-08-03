import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme/tokens';

interface SectionHeaderProps {
  icon: string;
  title: string;
  /** The trailing link label (e.g. "View all"). `link` is accepted as an alias — both names were in live use before this was consolidated. */
  linkLabel?: string;
  link?: string;
  onLink?: () => void;
}

/** Shared "icon + title …… link" row used at the top of a home-screen section. Merged from two byte-identical copies (farmerHome + hub). */
function SectionHeaderBase({ icon, title, linkLabel, link, onLink }: SectionHeaderProps) {
  const label = linkLabel ?? link;
  return (
    <View style={styles.head}>
      <View style={styles.titleRow}>
        <Ionicons name={icon} size={16} color={colors.deepGreen.g3} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {!!label && (
        <Text style={styles.link} onPress={onLink} suppressHighlighting>
          {label}
        </Text>
      )}
    </View>
  );
}

export const SectionHeader = React.memo(SectionHeaderBase);

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 13, fontWeight: '800', color: colors.deepGreen.n2 },
  link: { fontSize: 11, fontWeight: '700', color: colors.deepGreen.g3 },
});

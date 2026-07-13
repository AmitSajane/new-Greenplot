import React, { useMemo } from 'react';
import { Alert, Linking, StyleProp, Text, TextStyle } from 'react-native';

// Matches http(s)/www URLs so post text (success stories, tips, blog-style
// write-ups) can link out to sources, videos, articles etc. Deliberately
// simple (no full RFC 3986 parsing) — good enough for farmer-typed captions.
const URL_PATTERN = /((?:https?:\/\/|www\.)[^\s]+)/gi;

const normalizeUrl = (raw: string) => {
  // Trim trailing punctuation a sentence would leave attached, e.g. "...co.).".
  const trimmed = raw.replace(/[)\].,!?;:'"]+$/, '');
  const url = trimmed.startsWith('www.') ? `https://${trimmed}` : trimmed;
  return { url, trailing: raw.slice(trimmed.length) };
};

const openLink = (url: string) => {
  Linking.openURL(url).catch(() => Alert.alert("Can't open link", 'This link could not be opened.'));
};

interface Props {
  text: string;
  style?: StyleProp<TextStyle>;
  linkStyle?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

/** Renders post text with any http(s)/www URLs as tappable links (opens in
 * the device browser) — used for success stories, tips & blog-style posts
 * that reference an outside article, video, or source. */
export const Linkify = React.memo(({ text, style, linkStyle, numberOfLines }: Props) => {
  const parts = useMemo(() => {
    const matches = [...text.matchAll(URL_PATTERN)];
    if (!matches.length) return [{ text, isLink: false }] as const;

    const segments: { text: string; isLink: boolean; url?: string }[] = [];
    let cursor = 0;
    for (const match of matches) {
      const raw = match[0];
      const start = match.index ?? 0;
      if (start > cursor) segments.push({ text: text.slice(cursor, start), isLink: false });
      const { url, trailing } = normalizeUrl(raw);
      segments.push({ text: raw.slice(0, raw.length - trailing.length), isLink: true, url });
      if (trailing) segments.push({ text: trailing, isLink: false });
      cursor = start + raw.length;
    }
    if (cursor < text.length) segments.push({ text: text.slice(cursor), isLink: false });
    return segments;
  }, [text]);

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {parts.map((part, i) =>
        part.isLink && part.url ? (
          <Text key={i} style={linkStyle} onPress={() => openLink(part.url!)} suppressHighlighting={false}>
            {part.text}
          </Text>
        ) : (
          <Text key={i}>{part.text}</Text>
        ),
      )}
    </Text>
  );
});

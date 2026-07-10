import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';
import { NewPostTypeExample } from '../../constants/communityData';

const KIND_ICON: Record<NewPostTypeExample['kind'], { name: string; bg: string; fg: string }> = {
  video: { name: 'videocam', bg: '#C02828', fg: '#fff' },
  blog: { name: 'document-text', bg: '#B87214', fg: '#fff' },
  poll: { name: 'bar-chart', bg: '#1A6B3A', fg: '#fff' },
  voice: { name: 'mic', bg: '#4B2EA8', fg: '#fff' },
  beforeAfter: { name: 'swap-horizontal', bg: '#0F4A28', fg: '#fff' },
};

/** Deterministic pseudo-random waveform bar heights (no live randomness so
 * the layout doesn't jitter on re-render). */
const WAVEFORM_HEIGHTS = [6, 14, 9, 20, 12, 24, 16, 8, 18, 22, 10, 15, 20, 7, 24, 13, 9, 19, 22, 11, 16, 8, 20, 14];

function VideoBody({ item }: { item: NewPostTypeExample }) {
  return (
    <View style={s.ntVideoBox}>
      <View style={s.ntPlayCircle}>
        <Ionicons name="play" size={20} color="#0F4A28" />
      </View>
      {!!item.durationLabel && <Text style={s.ntDurationTag}>{item.durationLabel}</Text>}
    </View>
  );
}

function BlogBody({ item }: { item: NewPostTypeExample }) {
  return (
    <>
      <View style={s.ntBlogCover} />
      {!!item.blogTitle && <Text style={s.ntBlogTitle}>{item.blogTitle}</Text>}
      {!!item.blogReadLabel && <Text style={s.ntBlogMeta}>{item.blogReadLabel}</Text>}
    </>
  );
}

function PollBody({ item }: { item: NewPostTypeExample }) {
  return (
    <>
      {!!item.pollQuestion && <Text style={s.ntPollQuestion}>{item.pollQuestion}</Text>}
      {item.pollOptions?.map(opt => (
        <View key={opt.label} style={s.ntPollRow}>
          <View style={s.ntPollLabelRow}>
            <Text style={s.ntPollLabel}>{opt.label}</Text>
            <Text style={s.ntPollPct}>{opt.pct}%</Text>
          </View>
          <View style={s.ntPollTrack}>
            <View style={[s.ntPollFill, { width: `${opt.pct}%` }]} />
          </View>
        </View>
      ))}
    </>
  );
}

function VoiceBody({ item }: { item: NewPostTypeExample }) {
  return (
    <>
      <View style={s.ntVoiceBox}>
        {WAVEFORM_HEIGHTS.map((h, i) => (
          <View key={i} style={[s.ntVoiceBar, { height: h }]} />
        ))}
      </View>
      {!!item.durationLabel && <Text style={s.ntVoiceDuration}>{item.durationLabel}</Text>}
    </>
  );
}

function BeforeAfterBody(_props: Props) {
  return (
    <View style={s.ntBaRow}>
      <View style={[s.ntBaHalf, s.ntBaBefore]}>
        <Text style={[s.ntBaTag, s.ntBaTagLeft]}>BEFORE</Text>
      </View>
      <View style={[s.ntBaHalf, s.ntBaAfter]}>
        <Text style={[s.ntBaTag, s.ntBaTagRight]}>AFTER</Text>
      </View>
      <View style={s.ntBaDivider}>
        <Ionicons name="swap-horizontal" size={14} color="#0F4A28" />
      </View>
    </View>
  );
}

interface Props {
  item: NewPostTypeExample;
}

/** Preview card for a proposed post format (video/blog/poll/voice/before-after).
 * Not backed by real data yet — see NEW_POST_TYPE_EXAMPLES for the plan. */
function NewPostTypeCardBase({ item }: Props) {
  const icon = KIND_ICON[item.kind];
  const Body = useMemo(() => {
    switch (item.kind) {
      case 'video':
        return VideoBody;
      case 'blog':
        return BlogBody;
      case 'poll':
        return PollBody;
      case 'voice':
        return VoiceBody;
      case 'beforeAfter':
        return BeforeAfterBody;
      default:
        return null;
    }
  }, [item.kind]);

  return (
    <View style={s.newTypeCard}>
      <View style={s.newTypeHead}>
        <View style={[s.newTypeIconBadge, { backgroundColor: icon.bg }]}>
          <Ionicons name={icon.name} size={17} color={icon.fg} />
        </View>
        <View style={s.flex1}>
          <Text style={s.newTypeTitle}>{item.title}</Text>
          <Text style={s.newTypeSubtitle}>{item.subtitle}</Text>
        </View>
        <View style={s.newTypeBadge}>
          <Text style={s.newTypeBadgeText}>NEW</Text>
        </View>
      </View>

      {Body && <Body item={item} />}

      <Text style={s.newTypeCaption}>{item.caption}</Text>
    </View>
  );
}

export const NewPostTypeCard = React.memo(NewPostTypeCardBase);

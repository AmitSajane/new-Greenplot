import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { hubStyles as s } from '../../styles/hub.styles';
import { Avatar } from './Avatar';

interface Props {
  onAddPhoto: () => void;
  onAddVideo: () => void;
  onAddVoice: () => void;
  onWritePost: () => void;
}

/** Post composer — quick entry to share a photo, video, voice note, or
 * written tip. */
export const Composer = React.memo(({ onAddPhoto, onAddVideo, onAddVoice, onWritePost }: Props) => (
  <View style={s.composer}>
    <TouchableOpacity style={s.compTop} activeOpacity={0.8} onPress={onWritePost}>
      <Avatar initials="YO" tone="green" />
      <View style={s.compInput}>
        <Text style={s.compInputText}>Share a success story, tip or photo…</Text>
      </View>
    </TouchableOpacity>
    <View style={s.compActions}>
      <TouchableOpacity style={[s.compBtn, s.compBtnGreen]} activeOpacity={0.8} onPress={onAddPhoto}>
        <Ionicons name="image" size={15} color="#1A6B3A" />
        <Text style={[s.compBtnText, s.compTextGreen]}>Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.compBtn, s.compBtnRed]} activeOpacity={0.8} onPress={onAddVideo}>
        <Ionicons name="videocam" size={15} color="#C02828" />
        <Text style={[s.compBtnText, s.compTextRed]}>Video</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.compBtn, s.compBtnPurple]} activeOpacity={0.8} onPress={onAddVoice}>
        <Ionicons name="mic" size={15} color="#4B2EA8" />
        <Text style={[s.compBtnText, s.compTextPurple]}>Voice</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.compBtn, s.compBtnAmber]} activeOpacity={0.8} onPress={onWritePost}>
        <Ionicons name="bulb" size={15} color="#B87214" />
        <Text style={[s.compBtnText, s.compTextAmber]}>Tip</Text>
      </TouchableOpacity>
    </View>
  </View>
));

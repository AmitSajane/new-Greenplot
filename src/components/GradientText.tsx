import React, { useState } from 'react';
import { Text, TextStyle, View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, TSpan, Text as SvgText } from 'react-native-svg';

interface GradientTextProps {
  children: string;
  style?: TextStyle;
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export function GradientText({
  children,
  style,
  colors = ['#AAD922', '#008000'],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
}: GradientTextProps) {
  const [textWidth, setTextWidth] = useState(0);
  const [textHeight, setTextHeight] = useState(0);

  const {
    fontSize = 16,
    fontWeight = '400',
    textAlign = 'left',
    ...textStyle
  } = style || {};

  const uniqueId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text
        style={[
          style,
          {
            opacity: 0,
            position: 'absolute',
          },
        ]}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setTextWidth(width);
          setTextHeight(height || (fontSize as number) * 1.4);
        }}
      >
        {children}
      </Text>
      {textWidth > 0 && textHeight > 0 && (
        <Svg height={textHeight} width={textWidth}>
          <Defs>
            <LinearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="0%">
              {colors.map((color, index) => (
                <Stop
                  key={index}
                  offset={`${(index / (colors.length - 1)) * 100}%`}
                  stopColor={color}
                />
              ))}
            </LinearGradient>
          </Defs>
          <SvgText
            fill={`url(#${uniqueId})`}
            fontSize={fontSize}
            fontWeight={fontWeight}
            x={textAlign === 'center' ? '50%' : textAlign === 'right' ? '100%' : '0%'}
            y={textHeight * 0.75}
            textAnchor={textAlign === 'center' ? 'middle' : textAlign === 'right' ? 'end' : 'start'}
          >
            <TSpan>{children}</TSpan>
          </SvgText>
        </Svg>
      )}
    </View>
  );
}


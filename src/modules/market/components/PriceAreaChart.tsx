import React from 'react';
import { View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Line,
  Path,
  Stop,
  Circle,
  Text as SvgText,
} from 'react-native-svg';
import { market, mTypography } from '../theme/marketTokens';

interface Props {
  history: number[];
  forecast: number[];
  width?: number;
  height?: number;
}

/**
 * Area chart with a solid "actual" line + dashed "AI forecast" tail and a
 * "Today" reference line, normalised to the combined value range.
 */
export default function PriceAreaChart({ history, forecast, width = 250, height = 110 }: Props) {
  const padL = 8;
  const padR = 6;
  const padT = 10;
  const padB = 18;
  const all = [...history, ...forecast];
  const max = Math.max(...all);
  const min = Math.min(...all);
  const range = max - min || 1;

  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const total = all.length - 1;

  const x = (i: number) => padL + (innerW * i) / total;
  const y = (v: number) => padT + innerH * (1 - (v - min) / range);

  const histPts = history.map((v, i) => `${x(i)},${y(v)}`);
  const histLine = `M${histPts.join(' L')}`;
  const histArea = `${histLine} L${x(history.length - 1)},${padT + innerH} L${padL},${padT + innerH} Z`;

  const forecastStartIdx = history.length - 1;
  const fcPts = [history[history.length - 1], ...forecast].map(
    (v, i) => `${x(forecastStartIdx + i)},${y(v)}`,
  );
  const fcLine = `M${fcPts.join(' L')}`;
  const lastX = x(total);
  const fcArea = `${fcLine} L${lastX},${padT + innerH} L${x(forecastStartIdx)},${padT + innerH} Z`;

  const todayX = x(forecastStartIdx);

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <SvgGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={market.g4} stopOpacity={0.3} />
            <Stop offset="1" stopColor={market.g4} stopOpacity={0} />
          </SvgGradient>
          <SvgGradient id="fcGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={market.a4} stopOpacity={0.25} />
            <Stop offset="1" stopColor={market.a4} stopOpacity={0} />
          </SvgGradient>
        </Defs>

        {/* baseline */}
        <Line x1={padL} y1={padT + innerH} x2={width - padR} y2={padT + innerH} stroke={market.n7} strokeWidth={0.5} />

        {/* actual */}
        <Path d={histArea} fill="url(#histGrad)" />
        <Path d={histLine} fill="none" stroke={market.g4} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* forecast */}
        <Path d={fcArea} fill="url(#fcGrad)" />
        <Path d={fcLine} fill="none" stroke={market.a3} strokeWidth={1.8} strokeDasharray="4,2.5" strokeLinecap="round" />

        {/* today reference */}
        <Line x1={todayX} y1={padT - 4} x2={todayX} y2={padT + innerH} stroke={market.a4} strokeWidth={0.8} strokeDasharray="3,2" />
        <SvgText x={todayX - 2} y={padT - 4} fill={market.a3} fontSize={mTypography.chart} textAnchor="end">
          Today
        </SvgText>

        {/* end dots */}
        <Circle cx={todayX} cy={y(history[history.length - 1])} r={3} fill={market.g4} stroke="#fff" strokeWidth={1.5} />
        <Circle cx={lastX} cy={y(forecast[forecast.length - 1])} r={2.5} fill={market.a3} stroke="#fff" strokeWidth={1.2} />

        {/* value labels */}
        <SvgText x={padL} y={y(max) - 2} fill={market.n4} fontSize={mTypography.chart}>
          ₹{max}
        </SvgText>
        <SvgText x={lastX} y={y(forecast[forecast.length - 1]) + 8} fill={market.r3} fontSize={mTypography.chart} textAnchor="end">
          ₹{forecast[forecast.length - 1]}
        </SvgText>
      </Svg>
    </View>
  );
}

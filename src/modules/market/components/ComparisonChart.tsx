import React from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { market } from '../theme/marketTokens';

interface Props {
  seriesA: number[];
  seriesB: number[];
  colorA?: string;
  colorB?: string;
  width?: number;
  height?: number;
  dots?: boolean;
}

/** Two-line comparison chart (e.g. Tomato vs Onion). */
export default function ComparisonChart({
  seriesA,
  seriesB,
  colorA = market.r3,
  colorB = '#5B9BD5',
  width = 222,
  height = 80,
  dots = true,
}: Props) {
  const padL = 8;
  const padR = 8;
  const padT = 10;
  const padB = 14;
  const all = [...seriesA, ...seriesB];
  const max = Math.max(...all);
  const min = Math.min(...all);
  const range = max - min || 1;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const n = Math.max(seriesA.length, seriesB.length) - 1;

  const x = (i: number) => padL + (innerW * i) / n;
  const y = (v: number) => padT + innerH * (1 - (v - min) / range);
  const toPath = (s: number[]) => `M${s.map((v, i) => `${x(i)},${y(v)}`).join(' L')}`;

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      <Line x1={padL} y1={padT + innerH} x2={width - padR} y2={padT + innerH} stroke={market.n7} strokeWidth={0.5} />
      <Path d={toPath(seriesA)} fill="none" stroke={colorA} strokeWidth={1.8} strokeLinecap="round" />
      <Path d={toPath(seriesB)} fill="none" stroke={colorB} strokeWidth={1.8} strokeLinecap="round" />
      {dots && (
        <>
          <Circle cx={x(seriesA.length - 1)} cy={y(seriesA[seriesA.length - 1])} r={3} fill={colorA} stroke="#fff" strokeWidth={1.5} />
          <Circle cx={x(seriesB.length - 1)} cy={y(seriesB[seriesB.length - 1])} r={3} fill={colorB} stroke="#fff" strokeWidth={1.5} />
        </>
      )}
    </Svg>
  );
}

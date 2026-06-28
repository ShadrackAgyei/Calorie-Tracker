import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  consumed: number;
  goal: number;
  size?: number;
}

const COLORS = { green: '#007A3D', yellow: '#FCD116', red: '#CE1126', track: '#E5E7EB' };

export function CalorieRing({ consumed, goal, size = 160 }: Props) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(consumed / goal, 1);
  const strokeDashoffset = circumference * (1 - progress);

  const color =
    progress > 1 ? COLORS.red : progress > 0.85 ? COLORS.yellow : COLORS.green;

  const remaining = goal - consumed;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.track}
          strokeWidth={14}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={14}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[styles.inner, { width: size - 40, height: size - 40 }]}>
        <Text style={styles.consumed}>{consumed}</Text>
        <Text style={styles.label}>kcal eaten</Text>
        <Text style={styles.remaining}>
          {remaining > 0 ? `${remaining} left` : `${Math.abs(remaining)} over`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  consumed: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  remaining: {
    fontSize: 12,
    color: '#007A3D',
    fontWeight: '600',
    marginTop: 4,
  },
});

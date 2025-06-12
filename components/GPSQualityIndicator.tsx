import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface GPSQualityIndicatorProps {
  accuracy: number | null;
  isAcquiring: boolean;
}

const GPSQualityIndicator: React.FC<GPSQualityIndicatorProps> = ({ accuracy, isAcquiring }) => {
  const getQualityColor = (accuracy: number | null): string => {
    if (accuracy === null) return '#666666'; // Gray for no signal
    if (accuracy <= 3) return '#4CAF50';     // Green for excellent (≤ 3m)
    if (accuracy <= 5) return '#8BC34A';     // Light green for very good (≤ 5m)
    if (accuracy <= 10) return '#FFC107';    // Yellow for good (≤ 10m)
    if (accuracy <= 20) return '#FF9800';    // Orange for moderate (≤ 20m)
    return '#F44336';                        // Red for poor (> 20m)
  };

  const color = getQualityColor(accuracy);

  return (
    <View style={styles.container}>
      <View style={styles.indicatorRow}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.statusText}>
          GPS: <Text style={[styles.qualityText, { color }]}>
            {accuracy !== null ?
                `±${Math.round(accuracy / 2 * 1.09361)} yards` :
                'Searching...'
            }
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 12,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  qualityText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default GPSQualityIndicator;

import * as React from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useShotManagement } from '@/hooks/useShotManagement';
import { useFocusEffect } from '@react-navigation/native';

interface HoleStats {
  holeNumber: number;
  totalShots: number;
  putts: number;
}

export default function ScorecardScreen() {
  const { shots, loadShots } = useShotManagement();

  useFocusEffect(
    React.useCallback(() => {
      // Reload shots from storage when focused to get the latest data.
      loadShots();
    }, [loadShots])
  );

  const holeStats: HoleStats[] = React.useMemo(() => {
    console.log('Recalculating scorecard stats...', { shotsCount: shots.length });

    const stats: HoleStats[] = [];

    for (let holeNumber = 1; holeNumber <= 18; holeNumber++) {
      const holeShots = shots.filter(shot => shot.holeNumber === holeNumber);
      const totalShots = holeShots.length;
      const putts = holeShots.filter(shot => shot.club === 'Putter').length;

      stats.push({
        holeNumber,
        totalShots,
        putts,
      });
    }

    return stats;
  }, [shots]);

  const totalShots = holeStats.reduce((sum, hole) => sum + hole.totalShots, 0);
  const totalPutts = holeStats.reduce((sum, hole) => sum + hole.putts, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Compact Summary Header */}
      <ThemedView style={styles.summaryContainer}>
        <ThemedText type="title" style={styles.title}>⛳ Scorecard</ThemedText>
      </ThemedView>

      <ThemedView style={styles.tableContainer}>
        {/* Totals (table summary) */}
        <View style={styles.tableFooter}>
          <ThemedText style={[styles.tableFooterText, styles.holeColumn]}>Total</ThemedText>
          <ThemedText style={[styles.tableFooterText, styles.shotsColumn]}>{totalShots}</ThemedText>
          <ThemedText style={[styles.tableFooterText, styles.puttsColumn]}>{totalPutts}</ThemedText>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <ThemedText style={[styles.tableHeaderText, styles.holeColumn]}>Hole</ThemedText>
          <ThemedText style={[styles.tableHeaderText, styles.shotsColumn]}>Shots</ThemedText>
          <ThemedText style={[styles.tableHeaderText, styles.puttsColumn]}>Putts</ThemedText>
        </View>

        {/* Table Rows */}
        <ScrollView style={styles.tableRowsContainer}>
          {holeStats.map((hole) => (
            <View key={`hole-${hole.holeNumber}`} style={styles.tableRow}>
              <ThemedText style={[styles.tableCellText, styles.holeColumn]}>
                {hole.holeNumber}
              </ThemedText>
              <ThemedText style={[styles.tableCellText, styles.shotsColumn]}>
                {hole.totalShots || '-'}
              </ThemedText>
              <ThemedText style={[styles.tableCellText, styles.puttsColumn]}>
                {hole.putts || '-'}
              </ThemedText>
            </View>
          ))}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A4314',
  },
  summaryContainer: {
    paddingVertical: 6,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#FFFFFF',
  },
  summary: {
    fontSize: 16,
  },
  tableContainer: {
    flex: 1,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  tableHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  tableRowsContainer: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tableCellText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#E0E0E0',
  },
  tableFooter: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  tableFooterText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  holeColumn: {
    flex: 1,
  },
  shotsColumn: {
    flex: 1,
  },
  puttsColumn: {
    flex: 1,
  },
});

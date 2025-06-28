import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { GolfShot } from '@/models/GolfShot';
import ShotCounter from './ShotCounter';

interface HoleSelectorProps {
  currentHole: number;
  onHoleChange: (hole: number) => void;
  shots: GolfShot[];
}

const HoleSelector: React.FC<HoleSelectorProps> = ({
  currentHole,
  onHoleChange,
  shots,
}) => {
  const currentShot = shots.filter(shot => shot.holeNumber === currentHole).length;
  
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.holeScroller}
      >
        {Array.from({length: 18}, (_, i) => i + 1).map((hole) => (
          <TouchableOpacity
            key={hole}
            style={[
              styles.holeButton,
              currentHole === hole && styles.holeButtonActive
            ]}
            onPress={() => onHoleChange(hole)}
          >
            <Text style={[
              styles.text,
              currentHole === hole && styles.textActive
            ]}>
              Hole {hole}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ShotCounter currentShot={currentShot} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 12,
    paddingHorizontal: 6,
    zIndex: 1,
  },
  holeScroller: {
    paddingRight: 20,
  },
  holeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  holeButtonActive: {
    backgroundColor: 'rgba(255, 107, 53, 0.5)',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  textActive: {
    color: '#fff',
  },
});

export default HoleSelector;

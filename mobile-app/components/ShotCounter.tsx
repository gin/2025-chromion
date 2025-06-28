import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface ShotCounterProps {
  currentShot: number;
}

const ShotCounter: React.FC<ShotCounterProps> = ({ currentShot }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Shot
        {'\n'}
        {currentShot}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 12,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ShotCounter;

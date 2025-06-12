import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ClearDataButtonProps {
  onClear: () => void;
}

const ClearDataButton: React.FC<ClearDataButtonProps> = ({ onClear }) => {
  const handlePress = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all saved shots? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['golfShots', 'lastKnownLocation']);
              onClear();
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ],
    );
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Text style={styles.text}>Clear All Data</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 100,
    right: 10,
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 8,
    opacity: 0.9,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default ClearDataButton;

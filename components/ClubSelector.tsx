import React from 'react';
import { StyleSheet, View, Modal, Text, TouchableOpacity, ScrollView } from 'react-native';

interface ClubSelectorProps {
  visible: boolean;
  onSelectClub: (club: string) => void;
  onCancel: () => void;
}

const CLUBS = [
  'Driver', '3', '4', '5', '6', '7', '8', '9', 'Pw', 'Gw', 'Sw', 'Lw', 'Putter'
];

const ClubSelector: React.FC<ClubSelectorProps> = ({ visible, onSelectClub, onCancel }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Select Club</Text>
          <ScrollView contentContainerStyle={styles.clubList}>
            {CLUBS.map((club) => (
              <TouchableOpacity
                key={club}
                style={styles.clubButton}
                onPress={() => onSelectClub(club)}
              >
                <Text style={styles.clubButtonText}>{club}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  clubList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  clubButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  clubButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButtonText: {
    color: '#ff6b35',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ClubSelector;

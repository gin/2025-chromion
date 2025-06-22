import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { GolfShot } from '@/models/GolfShot';
import { Coordinate } from '@/types/geo.types';

interface ShotEditorProps {
  visible: boolean;
  onClose: () => void;
  selectedShot: GolfShot | null;
  mapCenter: Coordinate | null;
  onDeleteShot: (shotId: string) => void;
  onEditLocation: (shotId: string, location: Coordinate) => void;
  onRequestClubSelection: (mode: 'add' | 'edit', shotId?: string, location?: Coordinate) => void;
}

const ShotEditor: React.FC<ShotEditorProps> = ({
  visible,
  onClose,
  selectedShot,
  mapCenter,
  onDeleteShot,
  onEditLocation,
  onRequestClubSelection,
}) => {
  // Use ref to prevent rapid multiple button presses
  const isProcessingRef = useRef(false);

  // Reset processing flag when modal becomes visible
  useEffect(() => {
    if (visible) {
      isProcessingRef.current = false;
    }
  }, [visible]);

  const handleDeleteShot = () => {
    if (!selectedShot || isProcessingRef.current) return;

    Alert.alert(
      'Delete Shot',
      'Are you sure you want to delete this shot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDeleteShot(selectedShot.id);
            onClose();
          }
        },
      ]
    );
  };

  const handleAddShot = () => {
    if (!mapCenter || isProcessingRef.current) return;
    isProcessingRef.current = true;
    onRequestClubSelection('add', undefined, mapCenter);
    // Reset after a short delay to prevent rapid multiple calls
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 500);
  };

  const handleEditClub = () => {
    if (!selectedShot || isProcessingRef.current) return;
    isProcessingRef.current = true;
    onRequestClubSelection('edit', selectedShot.id);
    // Reset after a short delay to prevent rapid multiple calls
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 500);
  };

  const handleEditLocation = () => {
    if (!selectedShot || !mapCenter) return;
    
    Alert.alert(
      'Update Shot Location',
      'Update this shot location to the current map center?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: () => {
            onEditLocation(selectedShot.id, mapCenter);
            onClose();
          }
        },
      ]
    );
  };



  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <Text style={styles.title}>
            {selectedShot
              ? `Edit Shot: Hole ${selectedShot.holeNumber}, Shot ${selectedShot.shotNumber}`
              : 'Add New Shot'}
          </Text>

          <View style={styles.buttonGroup}>
            {selectedShot && (
              <>
                <TouchableOpacity style={styles.actionButton} onPress={handleDeleteShot}>
                  <Text style={styles.actionButtonText}>Delete Shot</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleEditClub}>
                  <Text style={styles.actionButtonText}>
                    Change Club: {selectedShot.club || 'None'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleEditLocation}>
                  <Text style={styles.actionButtonText}>Update Location</Text>
                </TouchableOpacity>
              </>
            )}

            {!selectedShot && (
              <TouchableOpacity style={styles.actionButton} onPress={handleAddShot}>
                <Text style={styles.actionButtonText}>Add Shot at Center</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    maxHeight: '50%',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: 'white',
  },
});

export default ShotEditor;

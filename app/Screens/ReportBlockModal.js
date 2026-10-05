import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ReportBlockModal = ({
  visible,
  onClose,
  onReport,
  onBlock,
}) => {
  const [showReportReasons, setShowReportReasons] = useState(false);
  const [showBlockConfirmation, setShowBlockConfirmation] = useState(false);

  const reportReasons = [
    'Spam or misleading',
    'Harassment or bullying',
    'Inappropriate content',
    'Fake profile',
    'Scam or fraud',
    'Other',
  ];

  const handleClose = () => {
    setShowReportReasons(false);
    setShowBlockConfirmation(false);
    onClose?.();
  };

  const handleReport = reason => {
    setShowReportReasons(false);
    onReport?.(reason);
    handleClose();
  };

  const handleBlock = () => {
    setShowBlockConfirmation(false);
    onBlock?.();
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <View style={styles.modalContainer}>

          {/* Handle */}
          <View style={styles.handle} />

          {!showReportReasons && !showBlockConfirmation && (
            <>
              <Text style={styles.title}>Report or Block</Text>

              <Text style={styles.subtitle}>
                Choose an action for this profile
              </Text>

              {/* Report */}
              <TouchableOpacity
                style={styles.option}
                activeOpacity={0.8}
                onPress={() => setShowReportReasons(true)}
              >
                <View style={[styles.iconContainer, styles.reportIcon]}>
                  <MaterialCommunityIcons
                    name="flag-outline"
                    size={23}
                    color="#E53935"
                  />
                </View>

                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Report User</Text>
                  <Text style={styles.optionDescription}>
                    Report inappropriate or suspicious activity
                  </Text>
                </View>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#999"
                />
              </TouchableOpacity>

              {/* Block */}
              {/* <TouchableOpacity
                style={styles.option}
                activeOpacity={0.8}
                onPress={() => setShowBlockConfirmation(true)}
              >
                <View style={[styles.iconContainer, styles.blockIcon]}>
                  <MaterialCommunityIcons
                    name="block-helper"
                    size={21}
                    color="#D32F2F"
                  />
                </View>

                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Block User</Text>
                  <Text style={styles.optionDescription}>
                    You will no longer receive messages from this user
                  </Text>
                </View>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#999"
                />
              </TouchableOpacity> */}

              {/* Cancel */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Report Reasons */}
          {showReportReasons && (
            <>
              <View style={styles.headerRow}>
                <TouchableOpacity
                  onPress={() => setShowReportReasons(false)}
                >
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={25}
                    color="#222"
                  />
                </TouchableOpacity>

                <Text style={styles.title}>Report User</Text>

                <View style={{ width: 25 }} />
              </View>

              <Text style={styles.subtitle}>
                Why are you reporting this user?
              </Text>

              {reportReasons.map((reason, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.reason}
                  onPress={() => handleReport(reason)}
                >
                  <Text style={styles.reasonText}>{reason}</Text>

                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={22}
                    color="#999"
                  />
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Block Confirmation */}
          {showBlockConfirmation && (
            <View>
              <View style={styles.confirmIcon}>
                <MaterialCommunityIcons
                  name="block-helper"
                  size={35}
                  color="#D32F2F"
                />
              </View>

              <Text style={styles.confirmTitle}>
                Block this user?
              </Text>

              <Text style={styles.confirmDescription}>
                You won't be able to receive messages or interact with this
                user until you unblock them.
              </Text>

              <TouchableOpacity
                style={styles.blockButton}
                onPress={handleBlock}
              >
                <Text style={styles.blockButtonText}>
                  Block User
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowBlockConfirmation(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ReportBlockModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },

  handle: {
    width: 45,
    height: 5,
    borderRadius: 10,
    backgroundColor: '#D5D5D5',
    alignSelf: 'center',
    marginBottom: 22,
  },

  title: {
    fontSize: 21,
    fontWeight: '700',
    color: '#181818',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 20,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 17,
    backgroundColor: '#F8F8F8',
    marginBottom: 12,
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reportIcon: {
    backgroundColor: '#FFEBEE',
  },

  blockIcon: {
    backgroundColor: '#FDECEC',
  },

  optionContent: {
    flex: 1,
    marginLeft: 13,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },

  optionDescription: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    lineHeight: 17,
  },

  cancelButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  reason: {
    height: 55,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  reasonText: {
    fontSize: 15,
    color: '#222',
  },

  confirmIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 18,
  },

  confirmTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#181818',
    textAlign: 'center',
  },

  confirmDescription: {
    fontSize: 14,
    color: '#777',
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 22,
  },

  blockButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  blockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
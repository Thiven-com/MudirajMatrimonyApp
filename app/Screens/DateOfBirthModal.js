import React, { useMemo, useState } from 'react';
import {
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';

const DateOfBirthModal = ({
    visible,
    onClose,
    onSelect,
    initialDate,
    minimumAge = 1,
    maximumAge = 100,
}) => {
    const today = new Date();

    const getDefaultDate = () => {
        if (initialDate) {
            const date = new Date(initialDate);
            return isNaN(date.getTime()) ? new Date(2000, 0, 1) : date;
        }

        return new Date(
            today.getFullYear() - 18,
            today.getMonth(),
            today.getDate(),
        );
    };

    const [selectedDate, setSelectedDate] = useState(getDefaultDate());

    const maxDate = useMemo(
        () =>
            new Date(
                today.getFullYear() - minimumAge,
                today.getMonth(),
                today.getDate(),
            ),
        [minimumAge],
    );

    const minDate = useMemo(
        () =>
            new Date(
                today.getFullYear() - maximumAge,
                today.getMonth(),
                today.getDate(),
            ),
        [maximumAge],
    );

    const calculateAge = date => {
        let age = today.getFullYear() - date.getFullYear();

        const monthDiff = today.getMonth() - date.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < date.getDate())
        ) {
            age--;
        }

        return age;
    };

    const age = calculateAge(selectedDate);

    const formatDate = date => {
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleChange = (event, date) => {
        if (Platform.OS === 'android') {
            if (event.type === 'dismissed') {
                return;
            }
        }

        if (date) {
            setSelectedDate(date);
            let newDate = new Date(date).toISOString();
            onSelect?.(moment(newDate).format("DD/MM/YYYY"));
        }
    };

    const handleConfirm = () => {
        onSelect?.(selectedDate);
        onClose?.();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />

                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Date of Birth</Text>
                            <Text style={styles.subtitle}>
                                Select your date of birth
                            </Text>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.closeButton}
                            onPress={onClose}>
                            <MaterialCommunityIcons
                                name="close"
                                size={22}
                                color="#555"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Selected Date */}
                    <View style={styles.selectedDateCard}>
                        <View style={styles.calendarIcon}>
                            <MaterialCommunityIcons
                                name="calendar-heart"
                                size={30}
                                color="#7C3AED"
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.selectedLabel}>Selected Date</Text>

                            <Text style={styles.selectedDate}>
                                {formatDate(selectedDate)}
                            </Text>

                            <Text style={styles.ageText}>
                                Age: {age} years
                            </Text>
                        </View>
                    </View>

                    {/* Date Picker */}
                    <View style={styles.pickerContainer}>
                        <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                            onChange={handleChange}
                            maximumDate={maxDate}
                            minimumDate={minDate}
                            themeVariant="light"
                            style={styles.datePicker}
                        />
                    </View>

                    {/* Info */}
                    <View style={styles.infoContainer}>
                        <MaterialCommunityIcons
                            name="information-outline"
                            size={18}
                            color="#7C3AED"
                        />

                        <Text style={styles.infoText}>
                            Your date of birth will be used to calculate your age.
                        </Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.cancelButton}
                            onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={styles.confirmButton}
                            onPress={handleConfirm}>
                            <MaterialCommunityIcons
                                name="check"
                                size={20}
                                color="#FFF"
                            />

                            <Text style={styles.confirmText}>
                                Confirm
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default DateOfBirthModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },

    modalContainer: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
    },

    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#171717',
    },

    subtitle: {
        fontSize: 13,
        color: '#777',
        marginTop: 4,
    },

    closeButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#F3F3F5',
        alignItems: 'center',
        justifyContent: 'center',
    },

    selectedDateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 18,
        backgroundColor: '#F6F1FF',
        borderWidth: 1,
        borderColor: '#E7D9FF',
        marginBottom: 18,
    },

    calendarIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },

    selectedLabel: {
        fontSize: 12,
        color: '#777',
        marginBottom: 3,
    },

    selectedDate: {
        fontSize: 17,
        fontWeight: '700',
        color: '#222',
    },

    ageText: {
        fontSize: 12,
        color: '#7C3AED',
        fontWeight: '600',
        marginTop: 4,
    },

    pickerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FAFAFA',
        borderRadius: 18,
        overflow: 'hidden',
        minHeight: 190,
    },

    datePicker: {
        width: '100%',
        height: 190,
    },

    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F7FF',
        borderRadius: 12,
        padding: 11,
        marginTop: 15,
    },

    infoText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 12,
        color: '#666',
        lineHeight: 17,
    },

    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 18,
    },

    cancelButton: {
        flex: 1,
        height: 52,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F2F2F4',
    },

    cancelText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#555',
    },

    confirmButton: {
        flex: 1.4,
        height: 52,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#7C3AED',
        gap: 7,
    },

    confirmText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFF',
    },
});
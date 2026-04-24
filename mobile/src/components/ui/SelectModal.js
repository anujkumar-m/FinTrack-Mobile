import React from 'react';
import {
    Modal,
    View,
    Text,
    Pressable,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

export function SelectModal({
    visible,
    title,
    options,
    selectedValue,
    onSelect,
    onClose,
    isDark,
    accentColor = '#3B82F6',
}) {
    const styles = getStyles(isDark, accentColor);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
                    {title ? <Text style={styles.title}>{title}</Text> : null}

                    <View style={styles.optionsContainer}>
                        {options.map((option) => {
                            const isSelected = option.value === selectedValue;
                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                                    activeOpacity={0.85}
                                    onPress={() => {
                                        onSelect(option.value);
                                        onClose();
                                    }}
                                >
                                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const getStyles = (isDark, accentColor) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
            zIndex: 999,
        },
        sheet: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 18,
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        },
        title: {
            fontSize: 16,
            fontWeight: '700',
            color: isDark ? '#FFFFFF' : '#000000',
            marginBottom: 12,
        },
        optionsContainer: {
            backgroundColor: 'transparent',
        },
        optionRow: {
            height: 54,
            borderRadius: 12,
            paddingHorizontal: 12,
            marginBottom: 10,
            justifyContent: 'center',
            backgroundColor: 'transparent',
        },
        optionRowSelected: {
            backgroundColor: accentColor,
        },
        optionText: {
            fontSize: 16,
            color: isDark ? '#FFFFFF' : '#000000',
        },
        optionTextSelected: {
            color: '#FFFFFF',
            fontWeight: '600',
        },
    });

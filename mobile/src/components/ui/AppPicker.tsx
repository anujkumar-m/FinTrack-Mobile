import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../constants/theme';
const { SelectModal } = require('./SelectModal');

interface AppPickerProps<T extends string> {
    label?: string;
    selectedValue: T;
    onValueChange: (value: T) => void;
    items: { label: string; value: T }[];
}

export function AppPicker<T extends string>({
    label,
    selectedValue,
    onValueChange,
    items,
}: AppPickerProps<T>) {
    const { isDark } = useTheme();
    const [visible, setVisible] = React.useState(false);
    const styles = getStyles(isDark);
    const selectedLabel = items.find((item) => item.value === selectedValue)?.label ?? 'Select';

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TouchableOpacity activeOpacity={0.85} style={styles.trigger} onPress={() => setVisible(true)}>
                <Text style={styles.triggerText}>{selectedLabel}</Text>
                <Feather name="chevron-down" size={18} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>

            <SelectModal
                visible={visible}
                title={label || 'Select'}
                options={items}
                selectedValue={selectedValue}
                onSelect={(value: T) => onValueChange(value)}
                onClose={() => setVisible(false)}
                isDark={isDark}
                accentColor={Colors.primary}
            />
        </View>
    );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
    container: { width: '100%', marginVertical: 8, marginBottom: 12 },
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: isDark ? '#FFFFFF' : '#000000',
        marginBottom: 8,
    },
    trigger: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 12,
    },
    triggerText: {
        fontSize: 16,
        color: isDark ? '#FFFFFF' : '#000000',
    },
});

import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../constants/theme';
import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface AppTextInputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export function AppTextInput({ label, error, style, ...props }: AppTextInputProps) {
    const { colors: Colors, isDark } = useTheme();
    const styles = getStyles(Colors, isDark);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[styles.input, error ? styles.inputError : null, style]}
                placeholderTextColor={Colors.textMuted}
                {...props}
            />
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const getStyles = (Colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    container: { marginBottom: 12 },
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: isDark ? '#FFFFFF' : '#000000',
        marginBottom: 8,
    },
    input: {
        height: 50,
        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        color: isDark ? '#FFFFFF' : '#000000',
        paddingHorizontal: 12,
        fontSize: 14,
    },
    inputError: {
        borderColor: Colors.expense,
    },
    error: {
        fontSize: 12,
        color: Colors.expense,
        marginTop: Spacing.xs,
    },
});

import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../constants/theme';
import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface AppButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
}

export function AppButton({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    style,
}: AppButtonProps) {
    const { colors: Colors } = useTheme();
    const styles = getStyles(Colors);

    const variantStyles: Record<string, { btn: ViewStyle; text: TextStyle }> = {
        primary: {
            btn: { backgroundColor: Colors.primary },
            text: { color: Colors.white },
        },
        outline: {
            btn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border },
            text: { color: Colors.textPrimary },
        },
        danger: {
            btn: { backgroundColor: Colors.expense },
            text: { color: Colors.white },
        },
        ghost: {
            btn: { backgroundColor: Colors.surface },
            text: { color: Colors.textSecondary },
        },
    };

    const sizeStyles: Record<string, { btn: ViewStyle; text: TextStyle }> = {
        sm: { btn: { paddingVertical: 6, paddingHorizontal: 12 }, text: { fontSize: 13 } },
        md: { btn: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl }, text: { fontSize: 14 } },
        lg: { btn: { paddingVertical: 16, paddingHorizontal: Spacing.xxl }, text: { fontSize: 16 } },
    };

    const vs = variantStyles[variant];
    const ss = sizeStyles[size];

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.base,
                vs.btn,
                ss.btn,
                (disabled || loading) && styles.disabled,
                style,
            ]}
            activeOpacity={0.75}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.white} size="small" />
            ) : (
                <Text style={[styles.text, vs.text, ss.text]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const getStyles = (Colors: ThemeColors) => StyleSheet.create({
    base: {
        minHeight: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    text: {
        fontWeight: '600',
    },
    disabled: {
        opacity: 0.5,
    },
});

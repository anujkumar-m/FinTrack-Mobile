import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors, Colors, Radius, Spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type Variant = 'default' | 'income' | 'expense' | 'savings' | 'balance';

interface StatCardProps {
    title: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: string;
    variant?: Variant;
}

export function StatCard({ title, value, change, changeType = 'neutral', icon, variant = 'default' }: StatCardProps) {
    const { colors: Colors } = useTheme();
    const styles = getStyles(Colors);

    const GRADIENTS: Record<Variant, readonly [string, string] | null> = {
        income: Colors.gradientIncome,
        expense: Colors.gradientExpense,
        savings: Colors.gradientSavings,
        balance: Colors.gradientBalance,
        default: null,
    };

    const gradient = GRADIENTS[variant];
    const isColored = variant !== 'default';

    const content = (
        <View style={styles.inner}>
            <View style={styles.row}>
                <View style={styles.textBlock}>
                    <Text style={[styles.title, isColored && styles.titleColored]} numberOfLines={1}>
                        {title}
                    </Text>
                    <Text 
                        style={[styles.value, isColored && styles.valueColored]} 
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {value}
                    </Text>
                    {change && (
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.change,
                                isColored
                                    ? styles.changeColored
                                    : changeType === 'positive'
                                        ? styles.changePositive
                                        : changeType === 'negative'
                                            ? styles.changeNegative
                                            : styles.changeMuted,
                            ]}
                        >
                            {change}
                        </Text>
                    )}
                </View>
                <View style={[styles.iconBox, isColored && styles.iconBoxColored]}>
                    <Ionicons name={icon as any} size={24} color={isColored ? Colors.white : Colors.textPrimary} />
                </View>
            </View>
            {/* Decorative circles */}
            {isColored && (
                <>
                    <View style={styles.circle1} />
                    <View style={styles.circle2} />
                </>
            )}
        </View>
    );

    if (gradient) {
        return (
            <LinearGradient colors={gradient} style={[styles.card, styles.cardGradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                {content}
            </LinearGradient>
        );
    }

    return <View style={[styles.card, styles.cardDefault]}>{content}</View>;
}

const getStyles = (Colors: ThemeColors) => StyleSheet.create({
    card: {
        borderRadius: 20, // Strict 20px rounding
        overflow: 'hidden',
        height: 140, // Consistent height for 2x2 grid
    },
    cardDefault: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardGradient: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    inner: {
        padding: 16,
        position: 'relative',
        flex: 1,
        justifyContent: 'space-between',
    },
    row: {
        flexDirection: 'column', // Stacked for better grid fit
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flex: 1,
    },
    textBlock: { 
        width: '100%',
        marginTop: 'auto',
    },
    title: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    titleColored: { color: 'rgba(255,255,255,0.8)' },
    value: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    valueColored: { color: Colors.white },
    change: { fontSize: 10, marginTop: 4, fontWeight: '600' },
    changeColored: { color: 'rgba(255,255,255,0.7)' },
    changePositive: { color: Colors.income },
    changeNegative: { color: Colors.expense },
    changeMuted: { color: Colors.textMuted },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: Colors.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBoxColored: { backgroundColor: 'rgba(255,255,255,0.25)' },
    circle1: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: -40,
        right: -40,
    },
    circle2: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.06)',
        bottom: -20,
        left: -10,
    },
});

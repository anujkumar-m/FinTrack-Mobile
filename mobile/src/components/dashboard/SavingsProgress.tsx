import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../constants/theme';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SavingsGoal } from '../../types/finance';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface SavingsProgressProps {
    goals: SavingsGoal[];
}

function formatCurrency(n: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);
}

export function SavingsProgress({ goals }: SavingsProgressProps) {
    const { colors: Colors } = useTheme();
    const styles = getStyles(Colors);

    const displayGoals = goals.slice(0, 4);

    return (
        <View style={styles.card}>
            <Text style={styles.heading}>Savings Goals</Text>
            {displayGoals.length === 0 ? (
                <Text style={styles.empty}>No savings goals yet</Text>
            ) : (
                displayGoals.map((goal: any, index) => {
                    const pct = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
                    return (
                        <View key={goal._id || goal.id || index} style={styles.goalBlock}>
                            <View style={styles.goalHeader}>
                                <Text style={styles.goalIcon}>{goal.icon || '🎯'}</Text>
                                <View style={styles.goalText}>
                                    <Text style={styles.goalName}>{goal.name}</Text>
                                    <Text style={styles.goalAmt}>
                                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                                    </Text>
                                </View>
                                <Text style={styles.pctText}>{pct.toFixed(0)}%</Text>
                            </View>
                            <View style={styles.track}>
                                <View style={[styles.fill, { width: `${pct}%` }]} />
                            </View>
                        </View>
                    );
                })
            )}
        </View>
    );
}

const getStyles = (Colors: ThemeColors) => StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.md,
    },
    heading: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.lg,
    },
    empty: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', paddingVertical: Spacing.lg },
    goalBlock: { marginBottom: Spacing.lg },
    goalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
    goalIcon: { fontSize: 20, marginRight: Spacing.sm },
    goalText: { flex: 1 },
    goalName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
    goalAmt: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
    pctText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
    track: {
        height: 6,
        backgroundColor: Colors.border,
        borderRadius: Radius.full,
        overflow: 'hidden',
    },
    fill: {
        height: 6,
        backgroundColor: Colors.primary,
        borderRadius: Radius.full,
    },
});

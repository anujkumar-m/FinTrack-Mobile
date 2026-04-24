import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Transaction } from '../../types/finance';
import { ThemeColors, Radius, Spacing } from '../../constants/theme';

interface TransactionItemProps {
    item: Transaction;
}

function formatCurrency(amount: number = 0) {
    try {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
    } catch {
        return '₹0';
    }
}

function formatDate(dateStr: string) {
    try {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
        return 'N/A';
    }
}

export const TransactionItem = memo(function TransactionItem({ item }: TransactionItemProps) {
    const { colors: Colors } = useTheme();
    const styles = getStyles(Colors);

    const isExpense = item.type === 'expense';

    return (
        <View style={styles.row}>
            {/* Icon circle: arrow-up for money out (expense), arrow-down for money in (income) */}
            <View style={[
                styles.iconBox,
                { backgroundColor: isExpense ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)' }
            ]}>
                <Ionicons
                    name={isExpense ? 'arrow-up' : 'arrow-down'}
                    size={20}
                    color={isExpense ? Colors.expense : Colors.income}
                />
            </View>
            <View style={styles.info}>
                <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
                <Text style={styles.sub}>{item.category} · {formatDate(item.date)}</Text>
            </View>
            <Text style={[styles.amount, { color: isExpense ? Colors.expense : Colors.income }]}>
                {isExpense ? '-' : '+'}{formatCurrency(item.amount)}
            </Text>
        </View>
    );
});

const getStyles = (Colors: ThemeColors) => StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    info: { flex: 1 },
    desc: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    sub: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
        fontWeight: '500',
    },
    amount: {
        fontSize: 16,
        fontWeight: '800',
    },
});

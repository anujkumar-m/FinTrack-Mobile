import { useTheme } from '../../contexts/ThemeContext';
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Transaction } from '../../types/finance';
import { Radius, Spacing, ThemeColors } from '../../constants/theme';
import { TransactionItem } from './TransactionItem';

interface TransactionListProps {
    transactions: Transaction[];
}

export const TransactionList = memo(function TransactionList({ transactions }: TransactionListProps) {
    const { colors: Colors } = useTheme();
    const styles = getStyles(Colors);

    if (transactions.length === 0) {
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Recent Transactions</Text>
            {transactions.map((item, index) => {
                if (!item) return null;
                const key = (item as any)._id || item.id || index.toString();
                return (
                    <View key={key}>
                        <TransactionItem item={item} />
                        {index < transactions.length - 1 && <View style={styles.divider} />}
                    </View>
                );
            })}
        </View>
    );
});

const getStyles = (Colors: ThemeColors) => StyleSheet.create({
    container: {
        padding: 20,
    },
    heading: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.textPrimary,
        marginBottom: 20,
        letterSpacing: -0.2,
    },
    empty: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: { color: Colors.textMuted, fontSize: 14, fontWeight: '500' },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 16,
        opacity: 0.5,
    },
});

import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../constants/theme';
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bill, EMI } from '../../types/finance';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface UpcomingBillsProps {
    bills: Bill[];
    emis: EMI[];
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const UpcomingBills = memo(function UpcomingBills({ bills, emis }: UpcomingBillsProps) {
    const { colors: Colors } = useTheme();
    const styles = getStyles(Colors);

    const upcomingBills = bills.filter((b) => !b.isPaid).slice(0, 4);
    const activeEMIs = emis.filter((e) => !e.isPaid).slice(0, 2);

    const combined = [
        ...upcomingBills.map((b) => ({ id: (b as any)._id || b.id || Math.random().toString(), name: b.name, amount: b.amount, date: b.dueDate, type: 'bill' as const })),
        ...activeEMIs.map((e) => ({ id: (e as any)._id || e.id || Math.random().toString(), name: e.name, amount: e.amount, date: e.endDate, type: 'emi' as const })),
    ];

    return (
        <View style={styles.card}>
            <Text style={styles.heading}>Upcoming Bills & EMIs</Text>
            {combined.length === 0 ? (
                <Text style={styles.emptyText}>All bills paid 🎉</Text>
            ) : (
                <View style={styles.listWrap}>
                    {combined.map((item, index) => (
                        <View key={item.id}>
                            <View style={styles.row}>
                                <View style={[styles.dot, { backgroundColor: item.type === 'emi' ? Colors.savings : Colors.warning }]} />
                                <View style={styles.info}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.sub}>Due {formatDate(item.date)} · {item.type.toUpperCase()}</Text>
                                </View>
                                <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
                            </View>
                            {index < combined.length - 1 && <View style={styles.sep} />}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
});

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
    listWrap: {},
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: Spacing.md },
    info: { flex: 1 },
    name: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
    sub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
    amount: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
    sep: { height: 1, backgroundColor: Colors.border },
    emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', paddingVertical: Spacing.lg },
});

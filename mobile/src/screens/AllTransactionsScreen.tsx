import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../lib/api';
import type { Transaction } from '../types/finance';
import { Radius, Spacing, ThemeColors } from '../constants/theme';

type TxFilter = 'all' | 'expense' | 'income';

function fmt(amount: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
}

function fmtDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function AllTransactionsScreen() {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [filter, setFilter] = useState<TxFilter>('all');

    const { data: transactions = [], refetch, isFetching } = useQuery<Transaction[]>({
        queryKey: ['transactions', 'all'],
        queryFn: () => api.get<Transaction[]>('/transactions'),
    });

    const filtered = useMemo(() => {
        if (filter === 'all') return transactions;
        return transactions.filter((t) => t.type === filter);
    }, [transactions, filter]);

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                    <Feather name="arrow-left" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>All Transactions</Text>
                    <Text style={styles.headerSub}>Track every incoming and outgoing payment</Text>
                </View>
            </View>

            <View style={styles.filterRow}>
                {[
                    { label: 'All', value: 'all' as const },
                    { label: 'Spent', value: 'expense' as const },
                    { label: 'Received', value: 'income' as const },
                ].map((item) => (
                    <TouchableOpacity
                        key={item.value}
                        activeOpacity={0.85}
                        onPress={() => setFilter(item.value)}
                        style={[styles.filterBtn, filter === item.value && styles.filterBtnActive]}
                    >
                        <Text style={[styles.filterText, filter === item.value && styles.filterTextActive]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item, i) => (item as any)._id || item.id || i.toString()}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 20 }}
                refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />}
                ListEmptyComponent={() => <Text style={styles.emptyText}>No transactions found</Text>}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.rowTitle}>{item.description}</Text>
                            <Text style={styles.rowSub}>{item.category} · {fmtDate(item.date)}</Text>
                        </View>
                        <Text style={[styles.rowAmt, { color: item.type === 'expense' ? colors.expense : colors.income }]}>
                            {item.type === 'expense' ? '-' : '+'}{fmt(item.amount)}
                        </Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: colors.border,
        backgroundColor: colors.surface,
    },
    backBtn: { 
        width: 40, height: 40, alignItems: 'center', justifyContent: 'center', 
        borderRadius: 20, marginRight: 12, backgroundColor: colors.surfaceElevated 
    },
    headerTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
    headerSub: { fontSize: 13, color: colors.textSecondary, marginTop: 1, fontWeight: '500' },
    filterRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 },
    filterBtn: {
        flex: 1, height: 40, alignItems: 'center', justifyContent: 'center',
        borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
    },
    filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterText: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
    filterTextActive: { color: colors.white },
    row: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border,
        padding: 16, marginBottom: 12,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
    },
    rowTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
    rowSub: { fontSize: 12, color: colors.textSecondary, marginTop: 3, fontWeight: '500' },
    rowAmt: { fontSize: 16, fontWeight: '800' },
    emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15, fontWeight: '500' },
});

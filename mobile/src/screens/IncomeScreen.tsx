import { useTheme } from '../contexts/ThemeContext';
import { ThemeColors } from '../constants/theme';
import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
    View, Text, FlatList, StyleSheet, TextInput,
    TouchableOpacity, RefreshControl, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { AppButton } from '../components/ui/AppButton';
import { AppTextInput } from '../components/ui/AppTextInput';
import { AppModal } from '../components/ui/AppModal';
import { AppPicker } from '../components/ui/AppPicker';
import { TimeFilterBar, TimeFilter } from '../components/ui/TimeFilterBar';
import { api } from '../lib/api';
import type { Transaction } from '../types/finance';
import { Radius, Spacing } from '../constants/theme';

type PaymentMode = 'cash' | 'bank' | 'upi' | 'credit_card';
const PAYMENT_MODES = [
    { label: 'Cash', value: 'cash' },
    { label: 'Bank', value: 'bank' },
    { label: 'UPI', value: 'upi' },
    { label: 'Credit Card', value: 'credit_card' },
];

function fmt(n: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);
}
function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function filterByTime(txns: Transaction[], filter: TimeFilter, month: number, year: number): Transaction[] {
    const now = new Date();
    return txns.filter((t) => {
        const d = new Date(t.date);
        if (filter === 'weekly') {
            const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0,0,0,0);
            return d >= weekStart;
        }
        if (filter === 'monthly') return d.getMonth() + 1 === month && d.getFullYear() === year;
        if (filter === 'yearly') return d.getFullYear() === year;
        return true;
    });
}

const IncomeRow = React.memo(({ item, colors }: { item: Transaction; colors: any }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const pressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 8 }).start();
    const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPressIn={pressIn}
                onPressOut={pressOut}
                style={{
                    flexDirection: 'row', alignItems: 'center',
                    padding: 16,
                    backgroundColor: colors.surface,
                    borderRadius: 20,
                    borderWidth: 1, borderColor: colors.border,
                    marginBottom: 12,
                    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
                }}
            >
                <View style={{
                    width: 44, height: 44, borderRadius: 22,
                    backgroundColor: 'rgba(34,197,94,0.12)',
                    alignItems: 'center', justifyContent: 'center', marginRight: 16,
                }}>
                    <Feather name="trending-down" size={18} color={colors.income} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>{item.description}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 3, fontWeight: '500' }}>{item.category} · {fmtDate(item.date)}</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.income }}>+{fmt(item.amount)}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
});

export function IncomeScreen() {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    const navigation = useNavigation();

    const now = new Date();
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('monthly');
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [search, setSearch] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newDesc, setNewDesc] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newCategory, setNewCategory] = useState('Salary');
    const [newPayment, setNewPayment] = useState<PaymentMode>('bank');
    const [addError, setAddError] = useState('');

    const qc = useQueryClient();
    const { data: allIncomes = [], isLoading, isError, refetch, isFetching } = useQuery<Transaction[]>({
        queryKey: ['transactions', 'income'],
        queryFn: () => api.get<Transaction[]>('/transactions?type=income'),
    });

    const filtered = useMemo(() => {
        const time = filterByTime(allIncomes, timeFilter, selectedMonth, selectedYear);
        if (!search.trim()) return time;
        return time.filter(
            (i) => i.description.toLowerCase().includes(search.toLowerCase()) ||
                   i.category.toLowerCase().includes(search.toLowerCase())
        );
    }, [allIncomes, timeFilter, selectedMonth, selectedYear, search]);

    const total = filtered.reduce((a, t) => a + t.amount, 0);

    const addMutation = useMutation({
        mutationFn: async () => {
            const amount = parseFloat(newAmount);
            if (!newDesc.trim()) throw new Error('Description is required');
            if (isNaN(amount) || amount <= 0) throw new Error('Enter a valid amount');
            await api.post<Transaction>('/transactions', {
                type: 'income', amount, description: newDesc,
                category: newCategory, date: new Date().toISOString(), paymentMode: newPayment,
            });
        },
        onSuccess: () => {
            setIsAddOpen(false); setNewDesc(''); setNewAmount(''); setAddError('');
            qc.invalidateQueries({ queryKey: ['transactions', 'income'] });
            qc.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
        },
        onError: (err: Error) => setAddError(err.message),
    });

    const renderItem = useCallback(({ item }: { item: Transaction }) => (
        <IncomeRow item={item} colors={colors} />
    ), [colors]);

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                    <Feather name="arrow-left" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Income</Text>
                    <Text style={styles.headerSub}>Track your earnings</Text>
                </View>
                <TouchableOpacity style={styles.addFab} onPress={() => setIsAddOpen(true)} activeOpacity={0.8}>
                    <Feather name="plus" size={20} color={colors.white} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={filtered}
                renderItem={renderItem}
                keyExtractor={(item, i) => (item as any)._id || item.id || i.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />}
                ListHeaderComponent={() => (
                    <View>
                        <TimeFilterBar
                            filter={timeFilter}
                            onFilterChange={setTimeFilter}
                            selectedMonth={selectedMonth}
                            selectedYear={selectedYear}
                            onMonthYearChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
                        />

                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Total Income</Text>
                            <Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit>{fmt(total)}</Text>
                            <Text style={styles.summaryMeta}>{filtered.length} transactions</Text>
                        </View>

                        <View style={styles.searchWrap}>
                            <Feather name="search" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search income..."
                                placeholderTextColor={colors.textMuted}
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>

                        <Text style={styles.listHeading}>All Income ({filtered.length})</Text>
                        {isLoading && <Text style={styles.stateText}>Loading...</Text>}
                        {isError && <Text style={[styles.stateText, { color: colors.expense }]}>Failed to load.</Text>}
                        {!isLoading && !isError && filtered.length === 0 && (
                            <Text style={styles.stateText}>No income for this period</Text>
                        )}
                    </View>
                )}
                ListFooterComponent={() => <View style={{ height: 24 }} />}
            />

            <AppModal visible={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Income">
                <AppTextInput label="Description" value={newDesc} onChangeText={setNewDesc} placeholder="e.g. Monthly salary" />
                <AppTextInput label="Amount" value={newAmount} onChangeText={setNewAmount} placeholder="e.g. 3000" keyboardType="numeric" />
                <AppTextInput label="Category" value={newCategory} onChangeText={setNewCategory} placeholder="Category name" />
                <AppPicker label="Payment Mode" selectedValue={newPayment}
                    onValueChange={(v) => setNewPayment(v as PaymentMode)}
                    items={PAYMENT_MODES.map((m) => ({ label: m.label, value: m.value as string }))} />
                {addError ? <Text style={styles.errorText}>{addError}</Text> : null}
                <AppButton title="Save Income" onPress={() => addMutation.mutate()} loading={addMutation.isPending} style={{ marginTop: Spacing.md }} />
            </AppModal>
        </SafeAreaView>
    );
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
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
    addFab: { 
        width: 44, height: 44, borderRadius: 22, backgroundColor: colors.income, 
        alignItems: 'center', justifyContent: 'center',
        elevation: 4, shadowColor: colors.income, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    },
    content: { padding: 16, paddingBottom: 140 },
    summaryCard: {
        backgroundColor: colors.income, borderRadius: 20, padding: 24, marginBottom: 20,
        elevation: 4, shadowColor: colors.income, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10,
    },
    summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    summaryValue: { fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 6 },
    summaryMeta: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4, fontWeight: '500' },
    searchWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
        paddingHorizontal: 16, height: 48, marginBottom: 20,
    },
    searchInput: { flex: 1, color: colors.textPrimary, fontSize: 14, fontWeight: '500' },
    listHeading: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 16, letterSpacing: -0.2 },
    stateText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', paddingVertical: 40, fontWeight: '500' },
    errorText: { color: colors.expense, fontSize: 13, marginBottom: Spacing.sm, fontWeight: '600' },
});

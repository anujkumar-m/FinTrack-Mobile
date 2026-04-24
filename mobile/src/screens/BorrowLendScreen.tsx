import { useTheme } from '../contexts/ThemeContext';
import { ThemeColors } from '../constants/theme';
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, RefreshControl, Animated } from 'react-native';
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
import type { BorrowLend } from '../types/finance';
import { Radius, Spacing } from '../constants/theme';

function fmt(n: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);
}
function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function filterByTime(records: BorrowLend[], filter: TimeFilter, month: number, year: number): BorrowLend[] {
    const now = new Date();
    return records.filter((r) => {
        const d = new Date(r.date);
        if (filter === 'weekly') {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            return d >= weekStart;
        }
        if (filter === 'monthly') return d.getMonth() + 1 === month && d.getFullYear() === year;
        if (filter === 'yearly') return d.getFullYear() === year;
        return true;
    });
}

const TYPE_OPTIONS = [
    { label: 'Borrowed (I owe)', value: 'borrowed' },
    { label: 'Lent (Owed to me)', value: 'lent' },
];

const RecordRow = React.memo(({ item, colors, onSettle }: { item: BorrowLend; colors: any; onSettle: (item: BorrowLend) => void }) => {
    const isLent = item.type === 'lent';
    const scale = useRef(new Animated.Value(1)).current;

    const pressIn = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, friction: 8 }).start();
    const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={pressIn}
                onPressOut={pressOut}
                disabled={item.status === 'paid'}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    backgroundColor: colors.surface,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginBottom: 12,
                    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
                }}
            >
                <View style={{
                    width: 44, height: 44, borderRadius: 22,
                    backgroundColor: isLent ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                    alignItems: 'center', justifyContent: 'center', marginRight: 16,
                }}>
                    <Feather name={isLent ? 'arrow-up-right' : 'arrow-down-left'} size={18} color={isLent ? colors.income : colors.expense} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>{item.personName}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4, fontWeight: '500' }}>{item.purpose} · {fmtDate(item.date)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: isLent ? colors.income : colors.expense }}>{fmt(item.amount)}</Text>
                    {item.status === 'pending' ? (
                        <TouchableOpacity onPress={() => onSettle(item)} activeOpacity={0.8} style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8 }}>
                            <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff', textTransform: 'uppercase' }}>Settle</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 }}>
                            <Text style={{ fontSize: 10, color: colors.income, fontWeight: '800', letterSpacing: 0.5 }}>SETTLED</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});

export function BorrowLendScreen() {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const styles = getStyles(colors, isDark);

    const now = new Date();
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('monthly');
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [type, setType] = useState<'borrowed' | 'lent'>('lent');
    const [personName, setPersonName] = useState('');
    const [amount, setAmount] = useState('');
    const [purpose, setPurpose] = useState('');
    const [addError, setAddError] = useState('');

    const qc = useQueryClient();
    const { data: records = [], refetch, isFetching } = useQuery<BorrowLend[]>({
        queryKey: ['borrow-lend'],
        queryFn: () => api.get<BorrowLend[]>('/borrow-lend'),
    });

    const filtered = useMemo(() => {
        return filterByTime(records, timeFilter, selectedMonth, selectedYear);
    }, [records, timeFilter, selectedMonth, selectedYear]);

    const borrowedTotal = filtered.filter((r) => r.type === 'borrowed' && r.status === 'pending').reduce((a, r) => a + r.amount, 0);
    const lentTotal = filtered.filter((r) => r.type === 'lent' && r.status === 'pending').reduce((a, r) => a + r.amount, 0);

    const addMutation = useMutation({
        mutationFn: async () => {
            const amt = parseFloat(amount);
            if (!personName.trim()) throw new Error('Person name required');
            if (isNaN(amt) || amt <= 0) throw new Error('Enter valid amount');
            await api.post('/borrow-lend', { type, personName, amount: amt, purpose, date: new Date().toISOString(), status: 'pending' });
        },
        onSuccess: () => {
            setIsAddOpen(false); setPersonName(''); setAmount(''); setPurpose(''); setAddError('');
            qc.invalidateQueries({ queryKey: ['borrow-lend'] });
            qc.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
        },
        onError: (e: Error) => setAddError(e.message),
    });

    const markPaid = (record: BorrowLend) => {
        const id = (record as any)._id || record.id;
        if (!id) return;
        
        api.patch(`/borrow-lend/${id}`, { status: 'paid' }).then(() => {
            qc.invalidateQueries({ queryKey: ['borrow-lend'] });
            qc.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
        });
    };

    const renderItem = useCallback(({ item }: { item: BorrowLend }) => (
        <RecordRow item={item} colors={colors} onSettle={markPaid} />
    ), [colors]);

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                    <Feather name="arrow-left" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Borrow / Lend</Text>
                    <Text style={styles.headerSub}>Manage your debts</Text>
                </View>
                <TouchableOpacity style={styles.addFab} onPress={() => setIsAddOpen(true)} activeOpacity={0.8}>
                    <Feather name="plus" size={20} color={colors.white} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={filtered}
                renderItem={renderItem}
                keyExtractor={(r, i) => (r as any)._id || r.id || i.toString()}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
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

                        {/* Summary */}
                        <View style={styles.summaryRow}>
                            <View style={[styles.summaryCard, { borderColor: colors.expense }]}>
                                <Text style={styles.summaryLabel}>I OWE</Text>
                                <Text style={[styles.summaryValue, { color: colors.expense }]}>{fmt(borrowedTotal)}</Text>
                                <Text style={styles.summaryMeta}>Total pending</Text>
                            </View>
                            <View style={[styles.summaryCard, { borderColor: colors.income }]}>
                                <Text style={styles.summaryLabel}>OWED TO ME</Text>
                                <Text style={[styles.summaryValue, { color: colors.income }]}>{fmt(lentTotal)}</Text>
                                <Text style={styles.summaryMeta}>Total pending</Text>
                            </View>
                        </View>

                        <Text style={styles.listHeading}>All Records ({filtered.length})</Text>
                        {filtered.length === 0 && !isFetching && (
                            <Text style={styles.emptyText}>No records for this period</Text>
                        )}
                    </View>
                )}
                ListFooterComponent={() => <View style={{ height: 24 }} />}
            />

            <AppModal visible={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Record">
                <AppPicker label="Type" selectedValue={type} onValueChange={(v) => setType(v as 'borrowed' | 'lent')}
                    items={TYPE_OPTIONS.map((t) => ({ label: t.label, value: t.value as string }))} />
                <AppTextInput label="Person Name" value={personName} onChangeText={setPersonName} placeholder="e.g. John Doe" />
                <AppTextInput label="Amount" value={amount} onChangeText={setAmount} placeholder="e.g. 500" keyboardType="numeric" />
                <AppTextInput label="Purpose" value={purpose} onChangeText={setPurpose} placeholder="e.g. Lunch" />
                {addError ? <Text style={styles.errorText}>{addError}</Text> : null}
                <AppButton title="Save Record" onPress={() => addMutation.mutate()} loading={addMutation.isPending} style={{ marginTop: Spacing.md }} />
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
        width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, 
        alignItems: 'center', justifyContent: 'center',
        elevation: 4, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    },
    content: { padding: 16, paddingBottom: 140 },
    summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    summaryCard: {
        flex: 1, backgroundColor: colors.surface, borderRadius: 20,
        padding: 20, borderWidth: 1.5,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
    },
    summaryLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '700', letterSpacing: 0.5 },
    summaryValue: { fontSize: 22, fontWeight: '800', marginTop: 6 },
    summaryMeta: { fontSize: 11, color: colors.textMuted, marginTop: 4, fontWeight: '500' },
    listHeading: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 16, letterSpacing: -0.2 },
    emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 15, fontWeight: '500' },
    errorText: { color: colors.expense, fontSize: 13, marginBottom: Spacing.sm, fontWeight: '600' },
});

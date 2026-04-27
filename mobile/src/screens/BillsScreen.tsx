import { useTheme } from '../contexts/ThemeContext';
import { ThemeColors } from '../constants/theme';
import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../components/layout/ScreenLayout';
import { AppButton } from '../components/ui/AppButton';
import { AppTextInput } from '../components/ui/AppTextInput';
import { AppModal } from '../components/ui/AppModal';
import { api } from '../lib/api';
import type { Bill } from '../types/finance';
import { Radius, Spacing } from '../constants/theme';

function fmt(n: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);
}
function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function BillsScreen() {
    const { colors: Colors, isDark } = useTheme();
    const styles = getStyles(Colors, isDark);
    const insets = useSafeAreaInsets();

    const [isAddBillOpen, setIsAddBillOpen] = useState(false);
    const [billName, setBillName] = useState('');
    const [billAmount, setBillAmount] = useState('');
    const [billNotes, setBillNotes] = useState('');
    const [billDue, setBillDue] = useState('');
    const [addError, setAddError] = useState('');

    const qc = useQueryClient();
    const { data: bills = [], refetch, isFetching } = useQuery<Bill[]>({
        queryKey: ['bills', 'current'],
        queryFn: () => api.get<Bill[]>('/bills'),
    });
    const totalBillsDue = bills.filter((b) => !b.isPaid).reduce((a, b) => a + b.amount, 0);
    const pendingCount = bills.filter((b) => !b.isPaid).length;

    const sortedBills = useMemo(() => {
        return [...bills].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }, [bills]);

    const addBillMutation = useMutation({
        mutationFn: async () => {
            const amount = parseFloat(billAmount);
            if (!billName.trim()) throw new Error('Name required');
            if (isNaN(amount) || amount <= 0) throw new Error('Enter valid amount');
            if (!billDue.trim()) throw new Error('Due date is required');
            const parsedDueDate = new Date(billDue);
            if (Number.isNaN(parsedDueDate.getTime())) throw new Error('Use valid due date (YYYY-MM-DD)');
            const month = `${parsedDueDate.getFullYear()}-${String(parsedDueDate.getMonth() + 1).padStart(2, '0')}`;
            await api.post('/bills', {
                name: billName,
                amount,
                category: 'Dues',
                notes: billNotes,
                dueDate: parsedDueDate.toISOString(),
                month,
                isPaid: false,
                isRecurring: false,
            });
        },
        onSuccess: () => {
            setIsAddBillOpen(false); setBillName(''); setBillAmount(''); setBillNotes(''); setBillDue(''); setAddError('');
            qc.invalidateQueries({ queryKey: ['bills', 'current'] });
            qc.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
        },
        onError: (e: Error) => setAddError(e.message),
    });

    const markBillPaid = (bill: Bill) => {
        const id = (bill as any)._id || bill.id;
        if (!id) return;
        api.put(`/bills/${id}`, { isPaid: true }).then(() => {
            qc.refetchQueries({ queryKey: ['bills', 'current'], exact: false });
            qc.refetchQueries({ queryKey: ['dashboard', 'summary'], exact: false });
            qc.refetchQueries({ queryKey: ['transactions'], exact: false });
        }).catch((e: Error) => console.error('markBillPaid failed:', e.message));
    };

    return (
        <ScreenLayout title="Bills & Dues" subtitle="Track who, when, and what to pay" scrollable={false}>
            <FlatList
                data={sortedBills}
                keyExtractor={(bill, idx) => (bill as any)._id || bill.id || `bill-${idx}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 140 }}
                refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={Colors.primary} />}
                ListHeaderComponent={(
                    <>
                        <View style={styles.summaryCard}>
                            <View>
                                <Text style={styles.summaryLabel}>DUE THIS MONTH</Text>
                                <Text style={styles.summaryValue}>{fmt(totalBillsDue)}</Text>
                            </View>
                            <View style={[styles.badge, { backgroundColor: 'rgba(245,158,11,0.1)' }]}>
                                <Text style={[styles.badgeText, { color: Colors.warning }]}>{pendingCount} PENDING</Text>
                            </View>
                        </View>
                        <AppButton title="+ Add Bill" onPress={() => setIsAddBillOpen(true)} style={{ marginBottom: 24, borderRadius: 16 }} />
                    </>
                )}
                ListEmptyComponent={() => <Text style={styles.empty}>No bills tracked yet</Text>}
                renderItem={({ item }) => (
                    <View style={styles.rowCard}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.rowName}>{item.name}</Text>
                            <Text style={styles.rowSub}>Due {fmtDate(item.dueDate)}</Text>
                            {!!(item as any).notes && <Text style={[styles.rowSub, { fontStyle: 'italic', color: Colors.textMuted }]}>{(item as any).notes}</Text>}
                        </View>
                        <View style={styles.rowRight}>
                            <Text style={styles.rowAmt}>{fmt(item.amount)}</Text>
                            {!item.isPaid ? (
                                <TouchableOpacity onPress={() => markBillPaid(item)} activeOpacity={0.8} style={styles.payBtn}>
                                    <Text style={styles.payBtnText}>Settle</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.paidBadge}>
                                    <Text style={styles.paidText}>PAID</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
            />

            <AppModal visible={isAddBillOpen} onClose={() => setIsAddBillOpen(false)} title="Add Bill">
                <AppTextInput label="Name (who to pay)" value={billName} onChangeText={setBillName} placeholder="e.g. Electricity / Rahul" />
                <AppTextInput label="Amount" value={billAmount} onChangeText={setBillAmount} placeholder="e.g. 200" keyboardType="numeric" />
                <AppTextInput label="Notes" value={billNotes} onChangeText={setBillNotes} placeholder="Optional notes" />
                <AppTextInput label="Due Date (YYYY-MM-DD)" value={billDue} onChangeText={setBillDue} placeholder="2026-05-01" />
                {addError ? <Text style={styles.err}>{addError}</Text> : null}
                <AppButton title="Save Bill" onPress={() => addBillMutation.mutate()} loading={addBillMutation.isPending} style={{ marginTop: Spacing.md }} />
            </AppModal>
        </ScreenLayout>
    );
}

const getStyles = (Colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    summaryCard: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: Colors.surface, borderRadius: 20, padding: 20,
        borderWidth: 1, borderColor: Colors.border, marginBottom: 20,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
    },
    summaryLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    summaryValue: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginTop: 4 },
    badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
    badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    rowCard: {
        backgroundColor: Colors.surface, borderRadius: 20, borderWidth: 1, borderColor: Colors.border,
        padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center',
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
    },
    rowName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
    rowSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' },
    rowRight: { alignItems: 'flex-end' },
    rowAmt: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
    payBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8 },
    payBtnText: { fontSize: 11, fontWeight: '800', color: '#fff', textTransform: 'uppercase' },
    paidBadge: { backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 },
    paidText: { fontSize: 10, color: Colors.income, fontWeight: '800', letterSpacing: 0.5 },
    empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15, fontWeight: '500' },
    err: { color: Colors.expense, fontSize: 13, marginBottom: Spacing.sm, fontWeight: '600' },
});

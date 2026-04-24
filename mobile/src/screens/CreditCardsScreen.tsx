import { useTheme } from '../contexts/ThemeContext';
import { ThemeColors } from '../constants/theme';
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScreenLayout } from '../components/layout/ScreenLayout';
import { AppButton } from '../components/ui/AppButton';
import { AppTextInput } from '../components/ui/AppTextInput';
import { AppModal } from '../components/ui/AppModal';
import { api } from '../lib/api';
import type { CreditCard } from '../types/finance';
import { Colors, Radius, Spacing } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

function fmt(n: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);
}

const GRADIENTS: readonly [string, string][] = [
    ['#6C63FF', '#4F46E5'],
    ['#22C55E', '#16A34A'],
    ['#EF4444', '#DC2626'],
    ['#F59E0B', '#D97706'],
];

export function CreditCardsScreen() {
    const { colors: Colors, isDark } = useTheme();
    const styles = getStyles(Colors, isDark);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [cardName, setCardName] = useState('');
    const [last4, setLast4] = useState('');
    const [billAmount, setBillAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [addError, setAddError] = useState('');

    const qc = useQueryClient();
    const { data: cards = [], refetch, isFetching } = useQuery<CreditCard[]>({
        queryKey: ['credit-cards'],
        queryFn: () => api.get<CreditCard[]>('/credit-cards'),
    });

    const totalDue = cards.filter((c) => !c.isPaid).reduce((a, c) => a + c.billAmount, 0);

    const addMutation = useMutation({
        mutationFn: async () => {
            const amount = parseFloat(billAmount);
            if (!cardName.trim()) throw new Error('Card name required');
            if (last4.length !== 4) throw new Error('Enter last 4 digits');
            if (isNaN(amount) || amount <= 0) throw new Error('Enter valid bill amount');
            if (!dueDate.trim()) throw new Error('Due date is required');
            await api.post('/credit-cards', { name: cardName, lastFourDigits: last4, billAmount: amount, dueDate, isPaid: false });
        },
        onSuccess: () => {
            setIsAddOpen(false); setCardName(''); setLast4(''); setBillAmount(''); setAddError('');
            qc.invalidateQueries({ queryKey: ['credit-cards'] });
        },
        onError: (e: Error) => setAddError(e.message),
    });

    const markPaid = (card: CreditCard) => {
        const id = (card as any)._id || card.id;
        if (!id) return;
        api.patch(`/credit-cards/${id}`, { isPaid: true })
            .catch(() => api.put(`/credit-cards/${id}`, { ...card, isPaid: true }))
            .then(() => {
                qc.invalidateQueries({ queryKey: ['credit-cards'] });
                qc.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
            });
    };

    return (
        <ScreenLayout title="Credit Cards" subtitle="Manage your card bills" scrollable={false}>
            <FlatList
                data={cards}
                keyExtractor={(c, i) => (c as any)._id || c.id || i.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={Colors.primary} />}
                ListHeaderComponent={(
                    <>
                        <View style={styles.summaryCard}>
                            <View>
                                <Text style={styles.summaryLabel}>Total Due</Text>
                                <Text style={styles.summaryValue}>{fmt(totalDue)}</Text>
                            </View>
                            <View style={[styles.badge, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                                <Text style={[styles.badgeText, { color: Colors.expense }]}>{cards.filter((c) => !c.isPaid).length} Cards Unpaid</Text>
                            </View>
                        </View>
                        <AppButton title="+ Add New Card" onPress={() => setIsAddOpen(true)} style={{ marginBottom: 24, borderRadius: 16 }} />
                    </>
                )}
                ListEmptyComponent={() => <Text style={styles.empty}>No credit cards added yet</Text>}
                renderItem={({ item, index }) => {
                    const grad = GRADIENTS[index % GRADIENTS.length];
                    return (
                        <LinearGradient colors={grad} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <View style={styles.cardTop}>
                                <View>
                                    <Text style={styles.cardName}>{item.name}</Text>
                                    <Text style={styles.cardNum}>•••• •••• •••• {item.lastFourDigits}</Text>
                                </View>
                                <View style={[styles.badge, item.isPaid ? styles.paidBadge : styles.dueBadge]}>
                                    <Text style={styles.badgeText}>{item.isPaid ? '✓ PAID' : 'PAYMENT DUE'}</Text>
                                </View>
                            </View>
                            
                            <View style={styles.cardBottom}>
                                <View>
                                    <Text style={styles.cardLabel}>CURRENT BILL</Text>
                                    <Text style={styles.cardValue}>{fmt(item.billAmount)}</Text>
                                </View>
                                {!item.isPaid ? (
                                    <TouchableOpacity onPress={() => markPaid(item)} activeOpacity={0.8} style={styles.markPaidBtn}>
                                        <Text style={styles.markPaidText}>Pay Now</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={{ opacity: 0.8 }}>
                                        <Text style={[styles.cardLabel, { textAlign: 'right' }]}>STATUS</Text>
                                        <Text style={[styles.cardValue, { fontSize: 14 }]}>Settled</Text>
                                    </View>
                                )}
                            </View>
                        </LinearGradient>
                    );
                }}
            />

            <AppModal visible={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Credit Card">
                <AppTextInput label="Card Name" value={cardName} onChangeText={setCardName} placeholder="e.g. HDFC Regalia" />
                <AppTextInput label="Last 4 Digits" value={last4} onChangeText={setLast4} placeholder="1234" keyboardType="numeric" maxLength={4} />
                <AppTextInput label="Bill Amount" value={billAmount} onChangeText={setBillAmount} placeholder="e.g. 5000" keyboardType="numeric" />
                <AppTextInput label="Due Date (YYYY-MM-DD)" value={dueDate} onChangeText={setDueDate} placeholder="2026-05-01" />
                {addError ? <Text style={styles.err}>{addError}</Text> : null}
                <AppButton title="Save Card" onPress={() => addMutation.mutate()} loading={addMutation.isPending} style={{ marginTop: Spacing.md }} />
            </AppModal>
        </ScreenLayout>
    );
}

const getStyles = (Colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    content: { padding: 20, paddingBottom: 140 },
    summaryCard: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: Colors.surface, borderRadius: 20, padding: 20,
        borderWidth: 1, borderColor: Colors.border, marginBottom: 20,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
    },
    summaryLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    summaryValue: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, marginTop: 4 },
    card: { 
        borderRadius: 24, padding: 24, marginBottom: 16,
        elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardName: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
    badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
    paidBadge: { backgroundColor: 'rgba(255,255,255,0.2)' },
    dueBadge: { backgroundColor: 'rgba(0,0,0,0.2)' },
    badgeText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
    cardNum: { fontSize: 14, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, marginTop: 4, fontWeight: '600' },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 32 },
    cardLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 0.5 },
    cardValue: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 4 },
    markPaidBtn: { 
        backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10,
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
    },
    markPaidText: { fontSize: 13, fontWeight: '800', color: '#000' },
    empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15, fontWeight: '500' },
    err: { color: Colors.expense, fontSize: 13, marginBottom: Spacing.sm, fontWeight: '600' },
});

import { useTheme } from '../contexts/ThemeContext';
import { ThemeColors } from '../constants/theme';
import React, { useState, useCallback, useRef } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    RefreshControl, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { AppButton } from '../components/ui/AppButton';
import { AppTextInput } from '../components/ui/AppTextInput';
import { AppModal } from '../components/ui/AppModal';
import { api } from '../lib/api';
import type { SavingsGoal } from '../types/finance';
import { Radius, Spacing } from '../constants/theme';

function fmt(n: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);
}

interface GoalCardProps {
    item: SavingsGoal;
    colors: any;
    onDeposit: (goal: SavingsGoal) => void;
}

const GoalCard = React.memo(({ item, colors, onDeposit }: GoalCardProps) => {
    const pct = item.targetAmount > 0 ? Math.min((item.currentAmount / item.targetAmount) * 100, 100) : 0;
    const scale = useRef(new Animated.Value(1)).current;

    const pressIn = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, friction: 8 }).start();
    const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={pressIn}
                onPressOut={pressOut}
                style={{
                    backgroundColor: colors.surface,
                    borderRadius: 20,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginBottom: 16,
                    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10,
                }}
            >
                {/* Goal header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <View style={{ 
                        width: 50, height: 50, borderRadius: 25, 
                        backgroundColor: colors.surfaceElevated, 
                        alignItems: 'center', justifyContent: 'center', marginRight: 16 
                    }}>
                        <Text style={{ fontSize: 24 }}>{item.icon || '🎯'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.3 }}>{item.name}</Text>
                        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 3, fontWeight: '500' }}>Target: {fmt(item.targetAmount)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.primary }}>{pct.toFixed(0)}%</Text>
                        <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textMuted, marginTop: 2 }}>PROGRES</Text>
                    </View>
                </View>

                {/* Progress bar */}
                <View style={{ height: 10, backgroundColor: colors.surfaceElevated, borderRadius: 5, overflow: 'hidden', marginBottom: 20 }}>
                    <View style={{ height: 10, width: `${pct}%` as any, backgroundColor: colors.primary, borderRadius: 5 }} />
                </View>

                {/* Footer */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Saved so far</Text>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.income, marginTop: 2 }}>{fmt(item.currentAmount)}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => onDeposit(item)}
                        activeOpacity={0.8}
                        style={{ backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, elevation: 4, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
                    >
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>Add Money</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});

export function SavingsScreen() {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    const navigation = useNavigation();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [icon, setIcon] = useState('🎯');
    const [targetDate, setTargetDate] = useState('');
    const [depositAmount, setDepositAmount] = useState('');
    const [error, setError] = useState('');

    const qc = useQueryClient();

    const { data: goals = [], refetch, isFetching } = useQuery<SavingsGoal[]>({
        queryKey: ['savings', 'goals'],
        queryFn: () => api.get<SavingsGoal[]>('/savings-goals'),
    });

    const totalSaved = goals.reduce((a, g) => a + g.currentAmount, 0);
    const totalTarget = goals.reduce((a, g) => a + g.targetAmount, 0);

    const addMutation = useMutation({
        mutationFn: async () => {
            const t = parseFloat(target);
            if (!name.trim()) throw new Error('Name is required');
            if (isNaN(t) || t <= 0) throw new Error('Enter a valid target');
            await api.post('/savings-goals', {
                name, targetAmount: t, currentAmount: 0, icon,
                targetDate: targetDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            });
        },
        onSuccess: () => {
            setIsAddOpen(false); setName(''); setTarget(''); setError('');
            qc.invalidateQueries({ queryKey: ['savings', 'goals'] });
        },
        onError: (e: Error) => setError(e.message),
    });

    const depositMutation = useMutation({
        mutationFn: async () => {
            const amount = parseFloat(depositAmount);
            if (!selectedGoal) return;
            if (isNaN(amount) || amount <= 0) throw new Error('Enter a valid amount');
            await api.patch(`/savings-goals/${(selectedGoal as any)._id || selectedGoal.id}/add`, { amount });
        },
        onSuccess: () => {
            setIsDepositOpen(false); setDepositAmount(''); setError('');
            qc.invalidateQueries({ queryKey: ['savings', 'goals'] });
            qc.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
        },
        onError: (e: Error) => setError(e.message),
    });

    const handleDeposit = useCallback((goal: SavingsGoal) => {
        setSelectedGoal(goal);
        setDepositAmount('');
        setError('');
        setIsDepositOpen(true);
    }, []);

    const renderGoal = useCallback(({ item }: { item: SavingsGoal }) => (
        <GoalCard item={item} colors={colors} onDeposit={handleDeposit} />
    ), [colors, handleDeposit]);

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                    <Feather name="arrow-left" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Savings Goals</Text>
                    <Text style={styles.headerSub}>Plan for your future</Text>
                </View>
                <TouchableOpacity style={styles.addFab} onPress={() => setIsAddOpen(true)} activeOpacity={0.8}>
                    <Feather name="plus" size={20} color={colors.white} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={goals}
                renderItem={renderGoal}
                keyExtractor={(g) => (g as any)._id || g.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />}
                ListHeaderComponent={() => (
                    <View>
                        {/* Summary Card */}
                        <View style={styles.summaryCard}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.summaryLabel}>Total Saved</Text>
                                <Text style={styles.summaryValue}>{fmt(totalSaved)}</Text>
                            </View>
                            <View style={{ height: '100%', width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 20 }} />
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Text style={styles.summaryLabel}>Total Target</Text>
                                <Text style={styles.summaryValue}>{fmt(totalTarget)}</Text>
                            </View>
                        </View>

                        <Text style={styles.listHeading}>Your Goals ({goals.length})</Text>
                        {goals.length === 0 && !isFetching && (
                            <Text style={styles.stateText}>No savings goals yet. Create one!</Text>
                        )}
                    </View>
                )}
                ListFooterComponent={() => <View style={{ height: 24 }} />}
            />

            <AppModal visible={isAddOpen} onClose={() => setIsAddOpen(false)} title="New Savings Goal">
                <AppTextInput label="Goal Name" value={name} onChangeText={setName} placeholder="e.g. Emergency Fund" />
                <AppTextInput label="Target Amount" value={target} onChangeText={setTarget} placeholder="e.g. 10000" keyboardType="numeric" />
                <AppTextInput label="Icon (emoji)" value={icon} onChangeText={setIcon} placeholder="🎯" />
                <AppTextInput label="Target Date (YYYY-MM-DD)" value={targetDate} onChangeText={setTargetDate} placeholder="e.g. 2025-12-31" />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <AppButton title="Create Goal" onPress={() => addMutation.mutate()} loading={addMutation.isPending} style={{ marginTop: Spacing.md }} />
            </AppModal>

            <AppModal visible={isDepositOpen} onClose={() => setIsDepositOpen(false)} title={`Add to ${selectedGoal?.name}`}>
                <AppTextInput label="Amount to Add" value={depositAmount} onChangeText={setDepositAmount} placeholder="e.g. 500" keyboardType="numeric" />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <AppButton title="Add Savings" onPress={() => depositMutation.mutate()} loading={depositMutation.isPending} style={{ marginTop: Spacing.md }} />
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
        width: 44, height: 44, borderRadius: 22, backgroundColor: colors.savings, 
        alignItems: 'center', justifyContent: 'center',
        elevation: 4, shadowColor: colors.savings, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    },
    content: { padding: 16, paddingBottom: 140 },
    summaryCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.savings, borderRadius: 20, padding: 24,
        marginBottom: 24, elevation: 4, shadowColor: colors.savings, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10,
    },
    summaryLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    summaryValue: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 6 },
    listHeading: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 16, letterSpacing: -0.2 },
    stateText: { color: colors.textMuted, textAlign: 'center', paddingVertical: 40, fontSize: 15, fontWeight: '500' },
    errorText: { color: colors.expense, fontSize: 13, marginBottom: Spacing.sm, fontWeight: '600' },
});

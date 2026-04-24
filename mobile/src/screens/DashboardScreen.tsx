import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StatCard } from '../components/dashboard/StatCard';
import { TransactionList } from '../components/dashboard/TransactionList';
import { api } from '../lib/api';
import type { Transaction, CreditCard, SavingsGoal } from '../types/finance';
import { Spacing, ThemeColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

interface DashboardSummaryResponse {
    totals: { income: number; expenses: number; balance: number; savings: number };
    borrowLend: { pendingBorrowed: number; pendingLent: number };
    bills: { upcoming: any[] };
    emis: { active: any[]; monthlyTotal: number };
    creditCards: { dues: number; cards: CreditCard[] };
    savingsGoals: SavingsGoal[];
}

function formatCurrency(amount: number = 0) {
    try {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
    } catch {
        return '₹0';
    }
}

export function DashboardScreen() {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    const tabBarHeight = useBottomTabBarHeight();
    const navigation = useNavigation<any>();
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const { data: summary, refetch: refetchSummary, isFetching: f1 } = useQuery<DashboardSummaryResponse>({
        queryKey: ['dashboard', 'summary', monthKey],
        queryFn: () => api.get<DashboardSummaryResponse>(`/dashboard/summary?month=${monthKey}`),
    });

    const { data: transactions = [], refetch: refetchTx, isFetching: f2 } = useQuery<Transaction[]>({
        queryKey: ['transactions', 'all'],
        queryFn: () => api.get<Transaction[]>('/transactions'),
    });

    const refreshing = f1 || f2;
    const onRefresh = () => { refetchSummary(); refetchTx(); };
    const totalBillsDue = (summary?.bills.upcoming ?? [])
        .filter((b: any) => !b.isPaid)
        .reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
    const totalCreditCardDue = summary?.creditCards.dues ?? 0;
    const totalBorrowedDue = summary?.borrowLend.pendingBorrowed ?? 0;

    const totalDueThisMonth = totalBillsDue + totalCreditCardDue + totalBorrowedDue;
    // The dueThisMonthCount was only for bills, now the message is generic.
    // const dueThisMonthCount = (summary?.bills.upcoming ?? []).filter((b: any) => !b.isPaid).length;

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <View style={styles.root}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.title}>Dashboard</Text>
                    <Text style={styles.subtitle}>Your financial overview</Text>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={styles.scroll}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 40 }]}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                >
                    {/* 2x2 Grid Section */}
                    <View style={styles.gridContainer}>
                        <View style={styles.gridRow}>
                            <View style={styles.gridItem}>
                                <StatCard
                                    title="Total Balance"
                                    value={formatCurrency(summary?.totals.balance ?? 0)}
                                    icon="wallet"
                                    variant="balance"
                                />
                            </View>
                            <View style={styles.gridItem}>
                                <StatCard
                                    title="Income"
                                    value={formatCurrency(summary?.totals.income ?? 0)}
                                    icon="trending-up"
                                    variant="income"
                                />
                            </View>
                        </View>
                        <View style={styles.gridRow}>
                            <View style={styles.gridItem}>
                                <StatCard
                                    title="Expenses"
                                    value={formatCurrency(summary?.totals.expenses ?? 0)}
                                    icon="trending-down"
                                    variant="expense"
                                />
                            </View>
                            <View style={styles.gridItem}>
                                <StatCard
                                    title="Total Savings"
                                    value={formatCurrency(summary?.totals.savings ?? 0)}
                                    icon="cash"
                                    variant="savings"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Due This Month Card */}
                    <View style={styles.dueCard}>
                        <Text style={styles.dueLabel}>Due This Month</Text>
                        <Text style={styles.dueValue}>{formatCurrency(totalDueThisMonth)}</Text>
                        <Text style={styles.dueSubtitle}>Includes bills, cards & borrowings</Text>
                    </View>

                    {/* Recent Transactions Section */}
                    <View style={styles.transactionsWrapper}>
                        <TransactionList transactions={transactions.slice(0, 5)} />
                        <TouchableOpacity
                            style={styles.viewAllBtn}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('AllTransactions')}
                        >
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
    root: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        marginTop: 10,
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.textPrimary,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
        fontWeight: '500',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    gridContainer: {
        marginBottom: 20,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    gridItem: {
        width: '48%', // Approx half with gap
    },
    dueCard: {
        backgroundColor: isDark ? '#1E293B' : '#FFF7ED',
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: isDark ? '#334155' : '#FFEDD5',
    },
    dueLabel: {
        fontSize: 13,
        color: isDark ? '#F97316' : '#9A3412',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    dueValue: {
        fontSize: 28,
        fontWeight: '800',
        color: isDark ? '#F8FAFC' : colors.textPrimary,
        marginBottom: 4,
    },
    dueSubtitle: {
        fontSize: 12,
        color: isDark ? '#94A3B8' : '#C2410C',
        fontWeight: '500',
    },
    transactionsWrapper: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 4, // TransactionList has internal padding
        marginBottom: 100, // Extra space for floating navbar
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
    },
    viewAllBtn: {
        paddingVertical: 16,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.primary,
    },
});

import { useTheme } from '../contexts/ThemeContext';
import { ThemeColors } from '../constants/theme';
import React, { useState } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    RefreshControl, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { MonthlyTrendChart } from '../components/dashboard/MonthlyTrendChart';
import { TimeFilterBar, TimeFilter } from '../components/ui/TimeFilterBar';
import { api } from '../lib/api';
import type { MonthlyStats } from '../types/finance';
import { Radius, Spacing } from '../constants/theme';

const SCREEN_W = Dimensions.get('window').width;

interface AnalyticsOverview {
    monthlyStats: MonthlyStats[];
    categoryExpenses: { name: string; value: number; color: string }[];
}

// Fixed semantic colors per category
const CATEGORY_COLORS: Record<string, string> = {
    Food: '#EF4444',
    Transport: '#3B82F6',
    Shopping: '#8B5CF6',
    Bills: '#F59E0B',
    Entertainment: '#EC4899',
    Health: '#22C55E',
    Others: '#6B7280',
    Default: '#6C63FF',
};

function getCategoryColor(name: string): string {
    for (const key of Object.keys(CATEGORY_COLORS)) {
        if (name.toLowerCase().includes(key.toLowerCase())) return CATEGORY_COLORS[key];
    }
    return CATEGORY_COLORS.Default;
}

function fmt(n: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);
}

function filterStats(stats: MonthlyStats[], filter: TimeFilter, month: number, year: number): MonthlyStats[] {
    if (filter === 'monthly') return stats.filter((s) => {
        const [y, m] = s.month.split('-').map(Number);
        return m === month && y === year;
    });
    if (filter === 'yearly') return stats.filter((s) => s.month.startsWith(`${year}`));
    return stats.filter((s) => s.month.startsWith(`${year}`));
}

export function AnalyticsScreen() {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    const navigation = useNavigation();

    const now = new Date();
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('monthly');
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const selectedMonthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

    const { data: analytics, isLoading, refetch, isFetching } = useQuery<AnalyticsOverview>({
        queryKey: ['analytics', 'overview', timeFilter, selectedMonth, selectedYear],
        queryFn: () => {
            const query = timeFilter === 'monthly'
                ? `/analytics/overview?month=${selectedMonthKey}`
                : `/analytics/overview?year=${selectedYear}&months=12`;
            return api.get<AnalyticsOverview>(query);
        },
    });

    const monthlyStats = analytics?.monthlyStats ?? [];
    const categoryExpenses = analytics?.categoryExpenses ?? [];

    const filteredStats = filterStats(monthlyStats, timeFilter, selectedMonth, selectedYear);
    const latest = filteredStats.length > 0 ? filteredStats[filteredStats.length - 1] : null;
    const prev = filteredStats.length > 1 ? filteredStats[filteredStats.length - 2] : null;

    const savingsRate = latest && latest.totalIncome > 0
        ? ((latest.totalIncome - latest.totalExpenses) / latest.totalIncome) * 100 : 0;
    const incomeChange = latest && prev && prev.totalIncome > 0
        ? ((latest.totalIncome - prev.totalIncome) / prev.totalIncome) * 100 : 0;
    const expenseChange = latest && prev && prev.totalExpenses > 0
        ? ((latest.totalExpenses - prev.totalExpenses) / prev.totalExpenses) * 100 : 0;

    // Compute total for percentage calculation
    const catTotal = categoryExpenses.reduce((a, c) => a + c.value, 0);

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                    <Feather name="arrow-left" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Analytics</Text>
                    <Text style={styles.headerSub}>Financial insights</Text>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />}
            >
                <TimeFilterBar
                    filter={timeFilter}
                    onFilterChange={setTimeFilter}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onMonthYearChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
                    filters={['monthly', 'yearly']}
                />

                {isLoading ? (
                    <Text style={styles.loadingText}>Loading analytics...</Text>
                ) : (
                    <>
                        {/* Summary Metric Cards */}
                        {latest && (
                            <View style={styles.summaryRow}>
                                <View style={[styles.metricCard, { borderColor: colors.income }]}>
                                    <Text style={styles.metricLabel}>Income</Text>
                                    <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>
                                        {fmt(latest.totalIncome)}
                                    </Text>
                                    <Text style={[styles.metricChange, { color: incomeChange >= 0 ? colors.income : colors.expense }]}>
                                        {incomeChange >= 0 ? '▲' : '▼'} {Math.abs(incomeChange).toFixed(1)}%
                                    </Text>
                                </View>
                                <View style={[styles.metricCard, { borderColor: colors.expense }]}>
                                    <Text style={styles.metricLabel}>Expenses</Text>
                                    <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>
                                        {fmt(latest.totalExpenses)}
                                    </Text>
                                    <Text style={[styles.metricChange, { color: expenseChange <= 0 ? colors.income : colors.expense }]}>
                                        {expenseChange >= 0 ? '▲' : '▼'} {Math.abs(expenseChange).toFixed(1)}%
                                    </Text>
                                </View>
                                <View style={[styles.metricCard, { borderColor: colors.primary }]}>
                                    <Text style={styles.metricLabel}>Savings Rate</Text>
                                    <Text style={styles.metricValue}>{savingsRate.toFixed(0)}%</Text>
                                    <Text style={[styles.metricChange, { color: colors.textMuted }]}>of income</Text>
                                </View>
                            </View>
                        )}

                        {/* Monthly Trend Chart */}
                        <MonthlyTrendChart data={filteredStats} />

                        {/* Category Breakdown with proper colors */}
                        {categoryExpenses.length > 0 && (
                            <View style={styles.tableCard}>
                                <Text style={styles.tableHeading}>Spending by Category</Text>

                                {/* Simple bar chart visualization */}
                                {categoryExpenses.map((cat) => {
                                    const color = getCategoryColor(cat.name);
                                    const pctWidth = catTotal > 0 ? (cat.value / catTotal) * 100 : 0;
                                    const pctText = catTotal > 0 ? ((cat.value / catTotal) * 100).toFixed(1) : '0';
                                    return (
                                        <View key={cat.name} style={styles.catRow}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                                <View style={[styles.catDot, { backgroundColor: color }]} />
                                                <Text style={styles.catName} numberOfLines={1}>{cat.name}</Text>
                                                <Text style={styles.catPct}>{pctText}%</Text>
                                                <Text style={styles.catValue}>{fmt(cat.value)}</Text>
                                            </View>
                                            {/* Progress bar */}
                                            <View style={styles.catBarBg}>
                                                <View style={[styles.catBarFill, { width: `${pctWidth}%` as any, backgroundColor: color }]} />
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {!latest && (
                            <Text style={styles.loadingText}>No data for this period</Text>
                        )}
                    </>
                )}
            </ScrollView>
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
    content: { padding: 16, paddingBottom: 140 },
    loadingText: { color: colors.textSecondary, textAlign: 'center', marginTop: 60, fontSize: 15, fontWeight: '500' },
    summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    metricCard: {
        flex: 1, backgroundColor: colors.surface, borderRadius: 20,
        padding: 16, borderWidth: 1.5,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8,
    },
    metricLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    metricValue: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginTop: 6 },
    metricChange: { fontSize: 11, marginTop: 4, fontWeight: '700' },
    tableCard: {
        backgroundColor: colors.surface, borderRadius: 24,
        padding: 24, borderWidth: 1, borderColor: colors.border, marginTop: 8,
        elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10,
    },
    tableHeading: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginBottom: 20, letterSpacing: -0.2 },
    catRow: { marginBottom: 16 },
    catDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
    catName: { flex: 1, fontSize: 14, color: colors.textPrimary, fontWeight: '700' },
    catPct: { fontSize: 12, color: colors.textSecondary, marginRight: 8, fontWeight: '600' },
    catValue: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
    catBarBg: { height: 8, backgroundColor: colors.surfaceElevated, borderRadius: 4, overflow: 'hidden', marginTop: 8 },
    catBarFill: { height: 8, borderRadius: 4 },
});

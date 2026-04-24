import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../constants/theme';
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MonthlyStats } from '../../types/finance';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface MonthlyTrendChartProps {
    data: MonthlyStats[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
    const { colors: Colors } = useTheme();
    const styles = getStyles(Colors);

    if (!data || data.length === 0) {
        return (
            <View style={styles.card}>
                <Text style={styles.heading}>Monthly Trend</Text>
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>No trend data yet</Text>
                </View>
            </View>
        );
    }

    const labels = data.map((d) => {
        const [, month] = d.month.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[parseInt(month, 10) - 1] ?? d.month;
    });

    const incomeData = data.map((d) => d.totalIncome);
    const expenseData = data.map((d) => d.totalExpenses);

    return (
        <View style={styles.card}>
            <Text style={styles.heading}>Monthly Trend</Text>
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: Colors.income }]} />
                    <Text style={styles.legendText}>Income</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: Colors.expense }]} />
                    <Text style={styles.legendText}>Expenses</Text>
                </View>
            </View>
            <LineChart
                data={{
                    labels,
                    datasets: [
                        { data: incomeData, color: () => Colors.income, strokeWidth: 2 },
                        { data: expenseData, color: () => Colors.expense, strokeWidth: 2 },
                    ],
                }}
                width={SCREEN_WIDTH - 80}
                height={200}
                chartConfig={{
                    backgroundGradientFrom: Colors.surface,
                    backgroundGradientTo: Colors.surface,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(108,99,255,${opacity})`,
                    labelColor: () => Colors.textSecondary,
                    style: { borderRadius: Radius.lg },
                    propsForDots: { r: '3', strokeWidth: '1' },
                }}
                bezier
                style={{ borderRadius: Radius.lg }}
                withInnerLines={false}
                withOuterLines={false}
            />
        </View>
    );
}

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
        marginBottom: Spacing.sm,
    },
    legend: {
        flexDirection: 'row',
        gap: Spacing.lg,
        marginBottom: Spacing.md,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 12, color: Colors.textSecondary },
    empty: { height: 120, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: Colors.textMuted, fontSize: 14 },
});

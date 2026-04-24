import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../constants/theme';
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface DataItem {
    name: string;
    value: number;
    color: string;
}

interface SpendingChartProps {
    data: DataItem[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export function SpendingChart({ data }: SpendingChartProps) {
    const { colors: Colors } = useTheme();
    const styles = getStyles(Colors);

    if (!data || data.length === 0) {
        return (
            <View style={styles.card}>
                <Text style={styles.heading}>Spending by Category</Text>
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>No spending data</Text>
                </View>
            </View>
        );
    }

    const chartData = data.map((d) => ({
        name: d.name,
        population: d.value,
        color: d.color || Colors.primary,
        legendFontColor: Colors.textSecondary,
        legendFontSize: 12,
    }));

    return (
        <View style={styles.card}>
            <Text style={styles.heading}>Spending by Category</Text>
            <PieChart
                data={chartData}
                width={SCREEN_WIDTH - 80}
                height={180}
                chartConfig={{
                    color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
                    backgroundColor: Colors.surface,
                    backgroundGradientFrom: Colors.surface,
                    backgroundGradientTo: Colors.surface,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute={false}
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
        marginBottom: Spacing.lg,
    },
    empty: { height: 120, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: Colors.textMuted, fontSize: 14 },
});

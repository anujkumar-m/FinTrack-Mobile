/**
 * Shared TimeFilter component — Weekly | Monthly | Yearly segmented control
 * Also contains MonthYearPicker modal for selecting specific month/year.
 */
import React, { useState, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Modal,
    Animated
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors, Radius, Spacing } from '../../constants/theme';

export type TimeFilter = 'weekly' | 'monthly' | 'yearly';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const YEARS = [2022, 2023, 2024, 2025, 2026];

interface TimeFilterBarProps {
    filter: TimeFilter;
    onFilterChange: (f: TimeFilter) => void;
    selectedMonth: number;  // 1-12
    selectedYear: number;
    onMonthYearChange: (month: number, year: number) => void;
    filters?: TimeFilter[];
}

export function TimeFilterBar({
    filter, onFilterChange,
    selectedMonth, selectedYear, onMonthYearChange,
    filters = ['weekly', 'monthly', 'yearly']
}: TimeFilterBarProps) {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [tempMonth, setTempMonth] = useState(selectedMonth);
    const [tempYear, setTempYear] = useState(selectedYear);

    const ALL_FILTERS: { label: string; value: TimeFilter }[] = [
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Yearly', value: 'yearly' },
    ];
    const FILTERS = ALL_FILTERS.filter((item) => filters.includes(item.value));

    const handleApply = () => {
        onMonthYearChange(tempMonth, tempYear);
        setPickerOpen(false);
    };

    return (
        <View>
            {/* Segmented Filter */}
            <View style={styles.filterRow}>
                {FILTERS.map((f) => (
                    <TouchableOpacity
                        key={f.value}
                        style={[styles.filterBtn, filter === f.value && styles.filterBtnActive]}
                        onPress={() => onFilterChange(f.value)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.filterLabel, filter === f.value && styles.filterLabelActive]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Month/Year selector – only visible in Monthly mode */}
            {filter === 'monthly' && (
                <TouchableOpacity
                    style={styles.monthPickerBtn}
                    onPress={() => { setTempMonth(selectedMonth); setTempYear(selectedYear); setPickerOpen(true); }}
                    activeOpacity={0.8}
                >
                    <Text style={styles.monthPickerText}>
                        📅  {MONTHS[selectedMonth - 1]} {selectedYear}
                    </Text>
                    <Text style={styles.monthPickerChevron}>▾</Text>
                </TouchableOpacity>
            )}

            {filter === 'yearly' && (
                <TouchableOpacity
                    style={styles.monthPickerBtn}
                    onPress={() => { setTempYear(selectedYear); setPickerOpen(true); }}
                    activeOpacity={0.8}
                >
                    <Text style={styles.monthPickerText}>📅  {selectedYear}</Text>
                    <Text style={styles.monthPickerChevron}>▾</Text>
                </TouchableOpacity>
            )}

            {/* Picker Modal */}
            <Modal visible={pickerOpen} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>
                            {filter === 'yearly' ? 'Select Year' : 'Select Month & Year'}
                        </Text>

                        {/* Year Row */}
                        <Text style={styles.sectionLabel}>Year</Text>
                        <View style={styles.yearRow}>
                            {YEARS.map((y) => (
                                <TouchableOpacity
                                    key={y}
                                    style={[styles.yearBtn, tempYear === y && styles.yearBtnActive]}
                                    onPress={() => setTempYear(y)}
                                >
                                    <Text style={[styles.yearBtnText, tempYear === y && styles.yearBtnTextActive]}>
                                        {y}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Month Grid – Monthly only */}
                        {filter === 'monthly' && (
                            <>
                                <Text style={styles.sectionLabel}>Month</Text>
                                <View style={styles.monthGrid}>
                                    {MONTHS.map((m, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            style={[styles.monthBtn, tempMonth === i + 1 && styles.monthBtnActive]}
                                            onPress={() => setTempMonth(i + 1)}
                                        >
                                            <Text style={[styles.monthBtnText, tempMonth === i + 1 && styles.monthBtnTextActive]}>
                                                {m}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setPickerOpen(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
                                <Text style={styles.applyBtnText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    filterRow: {
        flexDirection: 'row',
        backgroundColor: colors.surfaceElevated,
        borderRadius: Radius.lg,
        padding: 3,
        marginBottom: Spacing.md,
    },
    filterBtn: {
        flex: 1,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Radius.md,
    },
    filterBtnActive: {
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    filterLabelActive: {
        color: colors.white,
    },
    monthPickerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm + 2,
        marginBottom: Spacing.md,
    },
    monthPickerText: { fontSize: 14, fontWeight: '600', color: colors.primary },
    monthPickerChevron: { fontSize: 14, color: colors.textMuted },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalCard: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: Spacing.xxxl,
        paddingBottom: Spacing.xxxl + 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: Spacing.sm,
        marginTop: Spacing.md,
    },
    yearRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    yearBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: Radius.md,
        backgroundColor: colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.border,
    },
    yearBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    yearBtnText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
    yearBtnTextActive: { color: colors.white },
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    monthBtn: {
        width: '22%',
        paddingVertical: 10,
        borderRadius: Radius.md,
        backgroundColor: colors.surfaceElevated,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    monthBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    monthBtnText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    monthBtnTextActive: { color: colors.white },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        marginTop: Spacing.xl,
    },
    cancelBtn: {
        flex: 1, height: 48,
        alignItems: 'center', justifyContent: 'center',
        borderRadius: Radius.lg,
        backgroundColor: colors.surfaceElevated,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cancelBtnText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
    applyBtn: {
        flex: 1, height: 48,
        alignItems: 'center', justifyContent: 'center',
        borderRadius: Radius.lg,
        backgroundColor: colors.primary,
    },
    applyBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
});

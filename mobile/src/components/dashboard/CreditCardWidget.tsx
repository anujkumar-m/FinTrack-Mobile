import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../constants/theme';
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard } from '../../types/finance';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface CreditCardWidgetProps {
    cards: CreditCard[];
}

function formatCurrency(n: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);
}

const CARD_GRADIENTS: readonly [string, string][] = [
    ['#6C63FF', '#4F46E5'],
    ['#22C55E', '#16A34A'],
    ['#EF4444', '#DC2626'],
    ['#F59E0B', '#D97706'],
];

export function CreditCardWidget({ cards }: CreditCardWidgetProps) {
    const { colors: Colors } = useTheme();
    const styles = getStyles(Colors);

    const displayCards = cards.slice(0, 4);

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Credit Cards</Text>
            {displayCards.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No credit cards</Text>
                </View>
            ) : (
                <FlatList
                    data={displayCards}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(c, index) => (c as any)._id || c.id || index.toString()}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item, index }) => {
                        const grad = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
                        return (
                            <LinearGradient colors={grad} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <View style={styles.cardTop}>
                                    <Text style={styles.cardName}>{item.name}</Text>
                                    <Text style={styles.cardIcon}>💳</Text>
                                </View>
                                <Text style={styles.cardNumber}>•••• •••• •••• {item.lastFourDigits}</Text>
                                <View style={styles.cardBottom}>
                                    <View>
                                        <Text style={styles.cardLabel}>Bill Amount</Text>
                                        <Text style={styles.cardValue}>{formatCurrency(item.billAmount)}</Text>
                                    </View>
                                    <View style={[styles.badge, item.isPaid ? styles.badgePaid : styles.badgeDue]}>
                                        <Text style={styles.badgeText}>{item.isPaid ? '✓ Paid' : 'Due'}</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        );
                    }}
                />
            )}
        </View>
    );
}

const getStyles = (Colors: ThemeColors) => StyleSheet.create({
    container: { marginBottom: Spacing.md },
    heading: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
        paddingHorizontal: 2,
    },
    listContent: { gap: Spacing.md },
    card: {
        borderRadius: Radius.xl,
        padding: Spacing.xl,
        width: 240,
        minHeight: 140,
        justifyContent: 'space-between',
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardName: { fontSize: 14, fontWeight: '700', color: Colors.white },
    cardIcon: { fontSize: 20 },
    cardNumber: { fontSize: 13, color: Colors.whiteAlpha60, letterSpacing: 1, marginVertical: Spacing.md },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    cardLabel: { fontSize: 11, color: Colors.whiteAlpha60 },
    cardValue: { fontSize: 16, fontWeight: '700', color: Colors.white, marginTop: 2 },
    badge: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
    badgePaid: { backgroundColor: 'rgba(34,197,94,0.25)' },
    badgeDue: { backgroundColor: 'rgba(239,68,68,0.25)' },
    badgeText: { fontSize: 11, fontWeight: '700', color: Colors.white },
    emptyCard: {
        backgroundColor: Colors.surface,
        borderRadius: Radius.xl,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyText: { color: Colors.textMuted, fontSize: 14 },
});

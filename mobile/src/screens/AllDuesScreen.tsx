import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScreenLayout } from '../components/layout/ScreenLayout';
import { api } from '../lib/api';
import { Bill, CreditCard, BorrowLend } from '../types/finance';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeColors, Spacing, Radius } from '../constants/theme';
import { formatCurrency } from '../lib/utils';
import { AppModal } from '../components/ui/AppModal';
import { AppTextInput } from '../components/ui/AppTextInput';
import { AppButton } from '../components/ui/AppButton';
import { Feather } from '@expo/vector-icons';

type DueItem = {
    id: string;
    type: 'bill' | 'credit' | 'borrow';
    title: string;
    amount: number;
    dueDate?: string;
    status: 'Paid' | 'Pending';
    originalItem: Bill | CreditCard | BorrowLend;
};

type FilterType = 'all' | 'bill' | 'credit' | 'borrow';

export function AllDuesScreen() {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const qc = useQueryClient();

    const [filter, setFilter] = useState<FilterType>('all');
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [addType, setAddType] = useState<'bill' | 'credit' | 'borrow' | null>(null);

    // Form states for adding new Bill
    const [newBillName, setNewBillName] = useState('');
    const [newBillAmount, setNewBillAmount] = useState('');
    const [newBillDueDate, setNewBillDueDate] = useState('');
    const [newBillError, setNewBillError] = useState('');

    // Form states for adding new Credit Card
    const [newCardName, setNewCardName] = useState('');
    const [newCardLast4, setNewCardLast4] = useState('');
    const [newCardBillAmount, setNewCardBillAmount] = useState('');
    const [newCardDueDate, setNewCardDueDate] = useState('');
    const [newCardError, setNewCardError] = useState('');

    // Form states for adding new Borrow
    const [newBorrowPersonName, setNewBorrowPersonName] = useState('');
    const [newBorrowAmount, setNewBorrowAmount] = useState('');
    const [newBorrowPurpose, setNewBorrowPurpose] = useState('');
    const [newBorrowDate, setNewBorrowDate] = useState('');
    const [newBorrowError, setNewBorrowError] = useState('');

    const { data: bills = [], isLoading: loadingBills, refetch: refetchBills } = useQuery<Bill[]> ({
        queryKey: ['bills', 'current'],
        queryFn: () => api.get<Bill[]>('/bills'),
    });

    const { data: creditCards = [], isLoading: loadingCreditCards, refetch: refetchCreditCards } = useQuery<CreditCard[]> ({
        queryKey: ['credit-cards'],
        queryFn: () => api.get<CreditCard[]>('/credit-cards'),
    });

    const { data: borrowLend = [], isLoading: loadingBorrowLend, refetch: refetchBorrowLend } = useQuery<BorrowLend[]> ({
        queryKey: ['borrow-lend'],
        queryFn: () => api.get<BorrowLend[]>('/borrow-lend'),
    });

    const addBillMutation = useMutation({
        mutationFn: async () => {
            const amount = parseFloat(newBillAmount);
            if (!newBillName.trim()) throw new Error('Bill name required');
            if (isNaN(amount) || amount <= 0) throw new Error('Enter valid amount');
            if (!newBillDueDate.trim()) throw new Error('Due date is required');
            await api.post('/bills', {
                name: newBillName,
                amount,
                dueDate: newBillDueDate,
                isPaid: false,
                isRecurring: false,
                category: 'Uncategorized' // Default category, can be expanded
            });
        },
        onSuccess: () => {
            setIsAddModalVisible(false);
            setNewBillName(''); setNewBillAmount(''); setNewBillDueDate(''); setNewBillError('');
            qc.invalidateQueries({ queryKey: ['bills', 'current'] });
            qc.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
        },
        onError: (e: Error) => setNewBillError(e.message),
    });

    const addCreditCardMutation = useMutation({
        mutationFn: async () => {
            const amount = parseFloat(newCardBillAmount);
            if (!newCardName.trim()) throw new Error('Card name required');
            if (newCardLast4.length !== 4) throw new Error('Enter last 4 digits');
            if (isNaN(amount) || amount <= 0) throw new Error('Enter valid bill amount');
            if (!newCardDueDate.trim()) throw new Error('Due date is required');
            await api.post('/credit-cards', {
                name: newCardName,
                lastFourDigits: newCardLast4,
                billAmount: amount,
                dueDate: newCardDueDate,
                isPaid: false
            });
        },
        onSuccess: () => {
            setIsAddModalVisible(false);
            setNewCardName(''); setNewCardLast4(''); setNewCardBillAmount(''); setNewCardDueDate(''); setNewCardError('');
            qc.invalidateQueries({ queryKey: ['credit-cards'] });
            qc.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
        },
        onError: (e: Error) => setNewCardError(e.message),
    });

    const addBorrowMutation = useMutation({
        mutationFn: async () => {
            const amount = parseFloat(newBorrowAmount);
            if (!newBorrowPersonName.trim()) throw new Error('Person name required');
            if (isNaN(amount) || amount <= 0) throw new Error('Enter valid amount');
            if (!newBorrowDate.trim()) throw new Error('Date is required');
            await api.post('/borrow-lend', {
                type: 'borrowed',
                personName: newBorrowPersonName,
                amount,
                purpose: newBorrowPurpose,
                date: newBorrowDate,
                status: 'pending'
            });
        },
        onSuccess: () => {
            setIsAddModalVisible(false);
            setNewBorrowPersonName(''); setNewBorrowAmount(''); setNewBorrowPurpose(''); setNewBorrowDate(''); setNewBorrowError('');
            qc.invalidateQueries({ queryKey: ['borrow-lend'] });
            qc.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
        },
        onError: (e: Error) => setNewBorrowError(e.message),
    });

    const allDues: DueItem[] = useMemo(() => {
        const mappedBills: DueItem[] = bills
            .filter(bill => !bill.isPaid)
            .map(bill => ({
                id: bill.id || (bill as any)._id || Math.random().toString(),
                type: 'bill',
                title: bill.name,
                amount: bill.amount,
                dueDate: bill.dueDate,
                status: bill.isPaid ? 'Paid' : 'Pending',
                originalItem: bill,
            }));

        const mappedCreditCards: DueItem[] = creditCards
            .filter(card => !card.isPaid)
            .map(card => ({
                id: card.id || (card as any)._id || Math.random().toString(),
                type: 'credit',
                title: card.name,
                amount: card.billAmount,
                dueDate: card.dueDate,
                status: card.isPaid ? 'Paid' : 'Pending',
                originalItem: card,
            }));

        const mappedBorrowed: DueItem[] = borrowLend
            .filter(item => item.type === 'borrowed' && item.status === 'pending')
            .map(item => ({
                id: item.id || (item as any)._id || Math.random().toString(),
                type: 'borrow',
                title: item.personName,
                amount: item.amount,
                dueDate: item.date,
                status: item.status === 'pending' ? 'Pending' : 'Paid',
                originalItem: item,
            }));

        return [...mappedBills, ...mappedCreditCards, ...mappedBorrowed].sort((a, b) => {
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            return dateA - dateB;
        });
    }, [bills, creditCards, borrowLend]);

    const filteredDues = useMemo(() => {
        return allDues.filter(item => {
            if (filter === 'all') return true;
            return item.type === filter;
        });
    }, [allDues, filter]);

    const refreshing = loadingBills || loadingCreditCards || loadingBorrowLend;
    const onRefresh = () => {
        refetchBills();
        refetchCreditCards();
        refetchBorrowLend();
        qc.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
    };

    const getTypeColor = (type: DueItem['type']) => {
        switch (type) {
            case 'bill': return '#F59E0B'; // Yellow
            case 'credit': return '#3B82F6'; // Blue
            case 'borrow': return '#EF4444'; // Red
            default: return colors.textSecondary;
        }
    };

    const renderItem = ({ item }: { item: DueItem }) => (
        <View style={styles.card}>
            <View style={styles.cardMain}>
                <View style={styles.cardLeft}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
                        <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
                    </View>
                </View>
                <Text style={styles.cardAmount}>{formatCurrency(item.amount)}</Text>
            </View>
            <View style={styles.cardFooter}>
                <Text style={styles.cardDueDate}>Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}</Text>
                <View style={[styles.statusBadge, item.status === 'Paid' ? styles.statusPaidBg : styles.statusPendingBg]}>
                    <Text style={[styles.statusText, item.status === 'Paid' ? styles.statusPaidText : styles.statusPendingText]}>
                        {item.status}
                    </Text>
                </View>
            </View>
        </View>
    );

    const handleAddPress = (type: 'bill' | 'credit' | 'borrow') => {
        setAddType(type);
        setIsAddModalVisible(true);
    };

    const renderAddModalContent = () => {
        switch (addType) {
            case 'bill':
                return (
                    <View>
                        <AppTextInput
                            label="Bill Name"
                            value={newBillName}
                            onChangeText={setNewBillName}
                            placeholder="e.g., Electricity Bill"
                        />
                        <AppTextInput
                            label="Amount"
                            value={newBillAmount}
                            onChangeText={setNewBillAmount}
                            keyboardType="numeric"
                            placeholder="e.g., 100"
                        />
                        <AppTextInput
                            label="Due Date (YYYY-MM-DD)"
                            value={newBillDueDate}
                            onChangeText={setNewBillDueDate}
                            placeholder="e.g., 2026-04-30"
                        />
                        {newBillError ? <Text style={styles.errorText}>{newBillError}</Text> : null}
                        <AppButton
                            title="Add Bill"
                            onPress={() => addBillMutation.mutate()}
                            loading={addBillMutation.isPending}
                            style={styles.modalButton}
                        />
                    </View>
                );
            case 'credit':
                return (
                    <View>
                        <AppTextInput
                            label="Card Name"
                            value={newCardName}
                            onChangeText={setNewCardName}
                            placeholder="e.g., Visa Rewards"
                        />
                        <AppTextInput
                            label="Last 4 Digits"
                            value={newCardLast4}
                            onChangeText={setNewCardLast4}
                            keyboardType="numeric"
                            maxLength={4}
                            placeholder="e.g., 1234"
                        />
                        <AppTextInput
                            label="Bill Amount"
                            value={newCardBillAmount}
                            onChangeText={setNewCardBillAmount}
                            keyboardType="numeric"
                            placeholder="e.g., 500"
                        />
                        <AppTextInput
                            label="Due Date (YYYY-MM-DD)"
                            value={newCardDueDate}
                            onChangeText={setNewCardDueDate}
                            placeholder="e.g., 2026-05-15"
                        />
                        {newCardError ? <Text style={styles.errorText}>{newCardError}</Text> : null}
                        <AppButton
                            title="Add Credit Card"
                            onPress={() => addCreditCardMutation.mutate()}
                            loading={addCreditCardMutation.isPending}
                            style={styles.modalButton}
                        />
                    </View>
                );
            case 'borrow':
                return (
                    <View>
                        <AppTextInput
                            label="Person Name"
                            value={newBorrowPersonName}
                            onChangeText={setNewBorrowPersonName}
                            placeholder="e.g., John Doe"
                        />
                        <AppTextInput
                            label="Amount"
                            value={newBorrowAmount}
                            onChangeText={setNewBorrowAmount}
                            keyboardType="numeric"
                            placeholder="e.g., 200"
                        />
                        <AppTextInput
                            label="Purpose (Optional)"
                            value={newBorrowPurpose}
                            onChangeText={setNewBorrowPurpose}
                            placeholder="e.g., Lunch"
                        />
                        <AppTextInput
                            label="Date (YYYY-MM-DD)"
                            value={newBorrowDate}
                            onChangeText={setNewBorrowDate}
                            placeholder="e.g., 2026-04-22"
                        />
                        {newBorrowError ? <Text style={styles.errorText}>{newBorrowError}</Text> : null}
                        <AppButton
                            title="Add Borrow Entry"
                            onPress={() => addBorrowMutation.mutate()}
                            loading={addBorrowMutation.isPending}
                            style={styles.modalButton}
                        />
                    </View>
                );
            default:
                return (
                    <View>
                        <AppButton title="Add New Bill" onPress={() => handleAddPress('bill')} style={styles.modalButton} />
                        <AppButton title="Add New Credit Card" onPress={() => handleAddPress('credit')} style={styles.modalButton} />
                        <AppButton title="Add New Borrow" onPress={() => handleAddPress('borrow')} style={styles.modalButton} />
                    </View>
                );
        }
    };

    return (
        <ScreenLayout
            title="All Dues"
            subtitle="View all bills, cards & borrowings"
            scrollable={false}
            headerRight={
                <TouchableOpacity onPress={() => setIsAddModalVisible(true)} style={styles.addButton}>
                    <Feather name="plus" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            }
        >
            <View style={styles.filterContainer}>
                {(['all', 'bill', 'credit', 'borrow'] as FilterType[]).map((fType) => (
                    <TouchableOpacity
                        key={fType}
                        style={[styles.filterButton, filter === fType && styles.filterButtonActive]}
                        onPress={() => setFilter(fType)}
                    >
                        <Text style={[styles.filterButtonText, filter === fType && styles.filterButtonTextActive]}>
                            {fType.charAt(0).toUpperCase() + fType.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredDues}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContentContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                ListEmptyComponent={
                    !refreshing ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No data available</Text>
                        </View>
                    ) : null
                }
            />

            <AppModal
                visible={isAddModalVisible}
                onClose={() => {
                    setIsAddModalVisible(false);
                    setAddType(null);
                    setNewBillName(''); setNewBillAmount(''); setNewBillDueDate(''); setNewBillError('');
                    setNewCardName(''); setNewCardLast4(''); setNewCardBillAmount(''); setNewCardDueDate(''); setNewCardError('');
                    setNewBorrowPersonName(''); setNewBorrowAmount(''); setNewBorrowPurpose(''); setNewBorrowDate(''); setNewBorrowError('');
                }}
                title={addType ? `Add New ${addType}` : 'Add New Due'}
            >
                {renderAddModalContent()}
            </AppModal>
        </ScreenLayout>
    );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 20,
        gap: 8,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    filterButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        elevation: 4,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    filterButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    filterButtonTextActive: {
        color: '#FFFFFF',
    },
    listContentContainer: {
        paddingHorizontal: 16,
        paddingBottom: 140,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardLeft: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    typeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    cardAmount: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.textPrimary,
        textAlign: 'right',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    cardDueDate: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    statusPendingBg: {
        backgroundColor: 'rgba(245,158,11,0.1)',
    },
    statusPendingText: {
        color: colors.warning,
    },
    statusPaidBg: {
        backgroundColor: 'rgba(34,197,94,0.1)',
    },
    statusPaidText: {
        color: colors.success,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 80,
    },
    emptyStateText: {
        fontSize: 16,
        color: colors.textMuted,
        fontWeight: '600',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButton: {
        marginTop: 16,
        borderRadius: 16,
    },
    errorText: {
        color: colors.error,
        marginTop: 12,
        textAlign: 'center',
        fontWeight: '600',
    },
});

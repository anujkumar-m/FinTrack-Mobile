import React, { useMemo, useRef, useEffect, memo } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '../components/layout/ScreenLayout';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeColors, Radius, Spacing } from '../constants/theme';

type RootStackParamList = {
    MainTabs: undefined;
    Expenses: undefined;
    Income: undefined;
    Analytics: undefined;
    Savings: undefined;
    Cards: undefined;
    Bills: undefined;
    Borrow: undefined;
    AllDues: undefined; // Add AllDues to the RootStackParamList
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
    id: keyof RootStackParamList;
    icon: string;
    label: string;
    description: string;
    color: string;
    isMaterial: boolean;
}

const FeatureCard = memo(({
    item,
    index,
    isDark,
    colors,
    onPress
}: {
    item: MenuItem;
    index: number;
    isDark: boolean;
    colors: ThemeColors;
    onPress: (id: keyof RootStackParamList) => void;
}) => {
    const styles = getStyles(colors, isDark);

    const scale = useRef(new Animated.Value(1)).current;
    const fade = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, {
                toValue: 1,
                duration: 400,
                delay: index * 80,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                friction: 8,
                tension: 40,
                delay: index * 80,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.96,
            useNativeDriver: true,
            friction: 7,
            tension: 50,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 7,
            tension: 50,
        }).start();
    };

    return (
        <Animated.View
            style={[
                styles.cardContainer,
                { opacity: fade, transform: [{ scale }, { translateY }] }
            ]}
        >
            <Pressable
                onPress={() => onPress(item.id)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={({ pressed }) => [
                    styles.card,
                    pressed && { opacity: 0.9, backgroundColor: colors.surfaceElevated }
                ]}
            >
                <View style={styles.cardTop}>
                    <View style={[styles.iconBox, { backgroundColor: item.color + (isDark ? '20' : '12') }]}>
                        {item.isMaterial ? (
                            <MaterialCommunityIcons name={item.icon as any} size={26} color={item.color} />
                        ) : (
                            <Feather name={item.icon as any} size={24} color={item.color} />
                        )}
                    </View>
                    <Feather name="chevron-right" size={16} color={colors.textMuted} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.label}>{item.label}</Text>
                    <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                </View>
            </Pressable>
        </Animated.View>
    );
});

export function MoreScreen() {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    const navigation = useNavigation<NavigationProp>();
    const tabBarHeight = useBottomTabBarHeight();

    const MENU_ITEMS: MenuItem[] = useMemo(() => [
        { id: 'Expenses', icon: 'trending-down', label: 'Expenses', description: 'Track and manage expenses', color: colors.expense, isMaterial: false },
        { id: 'Income', icon: 'trending-up', label: 'Income', description: 'Log earnings and salary', color: colors.income, isMaterial: false },
        { id: 'Analytics', icon: 'pie-chart', label: 'Analytics', description: 'Visual spending insights', color: colors.primary, isMaterial: false },
        { id: 'Savings', icon: 'piggy-bank', label: 'Savings Goals', description: 'Save for your future goals', color: colors.savings, isMaterial: true },
        { id: 'Cards', icon: 'credit-card', label: 'Credit Cards', description: 'Manage cards and limits', color: colors.warning, isMaterial: false },
        { id: 'Bills', icon: 'file-document-outline', label: 'Bills & Dues', description: 'Track who, when, and what to pay', color: colors.warning, isMaterial: true },
        { id: 'Borrow', icon: 'handshake-outline', label: 'Borrow / Lend', description: 'Manage debts and loans', color: colors.info, isMaterial: true },
        { id: 'AllDues', icon: 'list', label: 'All Dues', description: 'View all bills, cards & borrowings', color: colors.error, isMaterial: false }, // New All Dues entry
    ], [colors]);

    const handlePress = (id: keyof RootStackParamList) => {
        navigation.navigate(id);
    };

    return (
        <ScreenLayout title="More" subtitle="Advanced features & tools" scrollable={false}>
            <View style={styles.container}>
                <FlatList
                    data={MENU_ITEMS}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.listContainer, { paddingBottom: tabBarHeight + 40 }]}
                    columnWrapperStyle={styles.row}
                    renderItem={({ item, index }) => (
                        <FeatureCard
                            item={item}
                            index={index}
                            isDark={isDark}
                            colors={colors}
                            onPress={handlePress}
                        />
                    )}
                />
            </View>
        </ScreenLayout>
    );
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
    },
    listContainer: {
        paddingTop: Spacing.xl,
        paddingBottom: 40,
        paddingHorizontal: Spacing.xl,
    },
    row: {
        gap: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    cardContainer: {
        flex: 1,
    },
    card: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: Radius.xl,
        padding: Spacing.xl,
        minHeight: 160,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0 : 0.05,
        shadowRadius: 10,
        elevation: isDark ? 0 : 3,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: Radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        marginTop: Spacing.md,
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    description: {
        fontSize: 12,
        color: colors.textSecondary,
        lineHeight: 16,
    }
});

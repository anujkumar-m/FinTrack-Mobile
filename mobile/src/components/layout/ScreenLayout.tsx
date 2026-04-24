import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../constants/theme';
import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../constants/theme';

interface ScreenLayoutProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    scrollable?: boolean;
    headerRight?: React.ReactNode;
}

export function ScreenLayout({
    title,
    subtitle,
    children,
    scrollable = true,
    headerRight,
}: ScreenLayoutProps) {
    const { colors: Colors, isDark } = useTheme();
    const styles = getStyles(Colors, isDark);

    const Content = scrollable ? ScrollView : View;

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={Colors.surface} />
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
                {headerRight && <View>{headerRight}</View>}
            </View>
            <Content
                style={styles.content}
                contentContainerStyle={scrollable ? styles.scrollContent : undefined}
                showsVerticalScrollIndicator={false}
            >
                {children}
            </Content>
        </SafeAreaView>
    );
}

const getStyles = (Colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerText: { flex: 1 },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.textPrimary,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
        fontWeight: '500',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 140,
    },
});

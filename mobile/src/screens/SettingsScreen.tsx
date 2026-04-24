import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { ThemeColors, Radius, Spacing } from '../constants/theme';
import { ScreenLayout } from '../components/layout/ScreenLayout';

interface SettingRowProps {
    label: string;
    value?: string;
    icon: any;
    onPress?: () => void;
    danger?: boolean;
    rightElement?: React.ReactNode;
}

function SettingRow({ label, value, icon, onPress, danger, rightElement }: SettingRowProps) {
    const { colors: Colors } = useTheme();
    const styles = getStyles(Colors);
    const Wrapper = onPress ? TouchableOpacity : View;

    return (
        <Wrapper style={styles.row} onPress={onPress} activeOpacity={0.7}>
            <Ionicons name={icon} size={20} color={danger ? Colors.expense : Colors.textSecondary} style={styles.rowIcon} />
            <View style={styles.rowInfo}>
                <Text style={[styles.rowLabel, { color: danger ? Colors.expense : Colors.textPrimary }]}>{label}</Text>
                {value && <Text style={styles.rowValue}>{value}</Text>}
            </View>
            {rightElement ? rightElement : (onPress ? <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} /> : null)}
        </Wrapper>
    );
}

export function SettingsScreen() {
    const { theme, isDark, toggleTheme, colors: Colors } = useTheme();
    const { user, logout } = useAuth();
    const globalStyles = getStyles(Colors);

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive', onPress: () => logout() },
        ]);
    };

    return (
        <ScreenLayout title="Settings" subtitle="App preferences">
            {/* Profile Section */}
            <View style={globalStyles.profileCard}>
                <View style={[globalStyles.avatar, { backgroundColor: Colors.primary + '20' }]}>
                    <Ionicons name="person" size={32} color={Colors.primary} />
                </View>
                <View>
                    <Text style={[globalStyles.profileName, { color: Colors.textPrimary }]}>{user?.name ?? 'User'}</Text>
                    <Text style={[globalStyles.profileEmail, { color: Colors.textSecondary }]}>{user?.email ?? ''}</Text>
                </View>
            </View>

            <View style={globalStyles.section}>
                <Text style={[globalStyles.sectionTitle, { color: Colors.textMuted }]}>Appearance</Text>
                <View style={[globalStyles.card, { backgroundColor: Colors.surface, borderColor: Colors.border }]}>
                    <SettingRow
                        icon="moon"
                        label="Dark Mode"
                        rightElement={
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                trackColor={{ false: Colors.border, true: Colors.primary }}
                                thumbColor={Colors.white}
                            />
                        }
                    />
                </View>
            </View>

            <View style={globalStyles.section}>
                <Text style={[globalStyles.sectionTitle, { color: Colors.textMuted }]}>App Info</Text>
                <View style={[globalStyles.card, { backgroundColor: Colors.surface, borderColor: Colors.border }]}>
                    <SettingRow icon="phone-portrait-outline" label="App Version" value="1.0.0" />
                    <View style={[globalStyles.divider, { backgroundColor: Colors.border }]} />
                    <SettingRow icon="server-outline" label="Backend Network" value={process.env.EXPO_PUBLIC_API_URL ?? 'Not configured'} />
                </View>
            </View>

            <View style={globalStyles.section}>
                <Text style={[globalStyles.sectionTitle, { color: Colors.textMuted }]}>Account</Text>
                <View style={[globalStyles.card, { backgroundColor: Colors.surface, borderColor: Colors.border }]}>
                    <SettingRow icon="log-out-outline" label="Log Out" onPress={handleLogout} danger />
                </View>
            </View>

            <View style={globalStyles.footer}>
                <Text style={[globalStyles.footerText, { color: Colors.textMuted }]}>FinTrack Mobile</Text>
            </View>
        </ScreenLayout>
    );
}

const getStyles = (Colors: ThemeColors) => StyleSheet.create({
    profileCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Colors.surface, padding: Spacing.xl,
        borderRadius: Radius.xl, marginBottom: Spacing.xl,
        borderWidth: 1, borderColor: Colors.border,
    },
    avatar: {
        width: 60, height: 60, borderRadius: 30,
        alignItems: 'center', justifyContent: 'center',
        marginRight: Spacing.lg,
    },
    profileName: { fontSize: 18, fontWeight: '700' },
    profileEmail: { fontSize: 14, marginTop: 2 },
    section: { marginBottom: Spacing.xl },
    sectionTitle: {
        fontSize: 12, fontWeight: '700',
        textTransform: 'uppercase', letterSpacing: 1,
        marginBottom: Spacing.sm,
    },
    card: {
        borderRadius: Radius.xl,
        borderWidth: 1, overflow: 'hidden',
    },
    divider: { height: 1, marginLeft: Spacing.xl + 24 + Spacing.md },
    footer: { alignItems: 'center', paddingVertical: Spacing.xl },
    footerText: { fontSize: 12, marginBottom: 4 },
    row: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl,
    },
    rowIcon: { marginRight: Spacing.md, width: 24, textAlign: 'center' },
    rowInfo: { flex: 1 },
    rowLabel: { fontSize: 14, fontWeight: '600' },
    rowValue: { fontSize: 12, marginTop: 2 },
});

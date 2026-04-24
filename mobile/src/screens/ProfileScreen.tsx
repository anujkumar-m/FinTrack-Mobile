import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenLayout } from '../components/layout/ScreenLayout';
import { useTheme } from '../contexts/ThemeContext';

export function ProfileScreen() {
    const { colors } = useTheme();
    return (
        <ScreenLayout title="Profile" subtitle="Manage your account">
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.textSecondary }}>Profile settings coming soon...</Text>
            </View>
        </ScreenLayout>
    );
}

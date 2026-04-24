import React, { useState } from 'react';
import {
    View, Text, StyleSheet, KeyboardAvoidingView,
    Platform, ScrollView, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AppTextInput } from '../components/ui/AppTextInput';
import { AppButton } from '../components/ui/AppButton';
import { ThemeColors, Spacing } from '../constants/theme';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
    navigation: LoginScreenNavigationProp;
}

export function LoginScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

    const { login, isLoading } = useAuth();
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);

    const validate = () => {
        let valid = true;
        const newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
            valid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
            valid = false;
        }

        if (!password) {
            newErrors.password = 'Password is required';
            valid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleLogin = async () => {
        if (!validate()) return;
        setErrors({});
        try {
            await login(email.trim().toLowerCase(), password);
        } catch (err: any) {
            setErrors({ general: err?.message || 'Login failed. Please check your credentials.' });
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                {/* ── Brand Logo ── */}
                <View style={styles.brand}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="trending-up" size={34} color="#fff" />
                    </View>
                    <Text style={styles.appName}>FinTrack</Text>
                    <Text style={styles.tagline}>Smart money. Clear picture.</Text>
                </View>

                {/* ── Auth Card ── */}
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Log in to your account</Text>

                    <View style={styles.form}>
                        {errors.general ? (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorBannerText}>{errors.general}</Text>
                            </View>
                        ) : null}

                        <AppTextInput
                            label="Email"
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (errors.email) setErrors({ ...errors, email: undefined });
                            }}
                            error={errors.email}
                        />

                        <AppTextInput
                            label="Password"
                            placeholder="Enter your password"
                            secureTextEntry
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) setErrors({ ...errors, password: undefined });
                            }}
                            error={errors.password}
                        />

                        <AppButton
                            title="Log In"
                            onPress={handleLogin}
                            loading={isLoading}
                            style={styles.submitButton}
                        />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <Text style={styles.linkText}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: Spacing.xl,
        paddingBottom: 40,
    },
    /* ── Brand ── */
    brand: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        // Glow
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 14,
        elevation: 10,
    },
    appName: {
        fontSize: 30,
        fontWeight: '800',
        color: colors.textPrimary,
        letterSpacing: -0.5,
    },
    tagline: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 4,
        fontWeight: '500',
    },
    /* ── Card ── */
    card: {
        borderRadius: 24,
        borderWidth: 1,
        padding: Spacing.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: Spacing.xl,
    },
    form: {
        gap: Spacing.md,
    },
    errorBanner: {
        backgroundColor: colors.error + '22',
        borderWidth: 1,
        borderColor: colors.error,
        borderRadius: 10,
        padding: Spacing.md,
    },
    errorBannerText: {
        color: colors.error,
        fontSize: 14,
        textAlign: 'center',
    },
    submitButton: {
        marginTop: Spacing.sm,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.lg,
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    linkText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
});

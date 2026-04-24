export interface ThemeColors {
    background: string;
    surface: string;
    surfaceElevated: string;
    border: string;

    primary: string;
    primaryLight: string;

    income: string;
    expense: string;
    savings: string;

    textPrimary: string;
    textSecondary: string;
    textMuted: string;

    gradientIncome: readonly [string, string];
    gradientExpense: readonly [string, string];
    gradientSavings: readonly [string, string];
    gradientBalance: readonly [string, string];

    warning: string;
    success: string;
    error: string;
    info: string;

    tabBarBackground: string;
    tabBarActive: string;
    tabBarInactive: string;

    white: string;
    whiteAlpha10: string;
    whiteAlpha20: string;
    whiteAlpha60: string;
    transparentSecondary: string;
}

export const darkColors: ThemeColors = {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceElevated: '#334155',
    border: '#1E293B',

    primary: '#6C63FF',
    primaryLight: '#8B85FF',

    income: '#22C55E',
    expense: '#EF4444',
    savings: '#38BDF8',

    textPrimary: '#F0F2FF',
    textSecondary: '#8B91B0',
    textMuted: '#5A6080',

    gradientIncome: ['#22C55E', '#16A34A'],
    gradientExpense: ['#EF4444', '#DC2626'],
    gradientSavings: ['#38BDF8', '#0EA5E9'],
    gradientBalance: ['#6C63FF', '#4F46E5'],

    warning: '#F59E0B',
    success: '#22C55E',
    error: '#EF4444',
    info: '#38BDF8',

    tabBarBackground: '#1E293B',
    tabBarActive: '#6C63FF',
    tabBarInactive: '#94A3B8',

    white: '#FFFFFF',
    whiteAlpha10: 'rgba(255,255,255,0.10)',
    whiteAlpha20: 'rgba(255,255,255,0.20)',
    whiteAlpha60: 'rgba(255,255,255,0.60)',
    transparentSecondary: 'rgba(255,255,255,0.05)',
};

export const lightColors: ThemeColors = {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceElevated: '#F1F5F9',
    border: '#E2E8F0',

    primary: '#4F46E5',
    primaryLight: '#6366F1',

    income: '#16A34A',
    expense: '#DC2626',
    savings: '#0284C7',

    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',

    gradientIncome: ['#22C55E', '#16A34A'],
    gradientExpense: ['#EF4444', '#DC2626'],
    gradientSavings: ['#38BDF8', '#0EA5E9'],
    gradientBalance: ['#4F46E5', '#4338CA'],

    warning: '#D97706',
    success: '#16A34A',
    error: '#DC2626',
    info: '#0284C7',

    tabBarBackground: '#FFFFFF',
    tabBarActive: '#4F46E5',
    tabBarInactive: '#94A3B8',

    white: '#FFFFFF',
    whiteAlpha10: 'rgba(0,0,0,0.05)',
    whiteAlpha20: 'rgba(0,0,0,0.10)',
    whiteAlpha60: 'rgba(0,0,0,0.60)',
    transparentSecondary: 'rgba(0,0,0,0.05)',
};

export const Colors = darkColors; // Fallback mapping

export const Fonts = {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
};

export const Radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

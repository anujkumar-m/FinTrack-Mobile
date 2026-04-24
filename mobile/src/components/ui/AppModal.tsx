import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../constants/theme';
import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface AppModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function AppModal({ visible, onClose, title, children }: AppModalProps) {
    const { colors: Colors, isDark } = useTheme();
    const styles = getStyles(Colors, isDark);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.wrapper}
                >
                    <View style={styles.sheet}>
                        <View style={styles.header}>
                            <Text style={styles.title}>{title}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Text style={styles.closeText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                            {children}
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const getStyles = (Colors: ThemeColors, isDark: boolean) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    wrapper: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sheet: {
        width: '90%',
        maxHeight: '85%',
        borderRadius: 20,
        padding: 20,
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: isDark ? '#FFFFFF' : '#000000',
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: Radius.full,
        backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeText: {
        color: isDark ? '#FFFFFF' : '#000000',
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        paddingBottom: 4,
    },
});

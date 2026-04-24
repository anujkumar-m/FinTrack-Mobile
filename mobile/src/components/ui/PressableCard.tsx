/**
 * PressableCard — Standard animated card with spring press feedback
 * Performance optimized with useNativeDriver
 */
import React, { useRef, useCallback } from 'react';
import { Animated, Pressable, StyleSheet, ViewStyle } from 'react-native';

interface PressableCardProps {
    onPress?: () => void;
    style?: ViewStyle | ViewStyle[];
    children: React.ReactNode;
    disabled?: boolean;
}

export const PressableCard = React.memo(function PressableCard({
    onPress, style, children, disabled
}: PressableCardProps) {
    const scale = useRef(new Animated.Value(1)).current;

    const pressIn = useCallback(() => {
        Animated.spring(scale, {
            toValue: 0.97,
            useNativeDriver: true,
            friction: 8,
            tension: 60,
        }).start();
    }, [scale]);

    const pressOut = useCallback(() => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 6,
            tension: 50,
        }).start();
    }, [scale]);

    return (
        <Animated.View style={[style, { transform: [{ scale }] }]}>
            <Pressable
                onPress={onPress}
                onPressIn={pressIn}
                onPressOut={pressOut}
                disabled={disabled}
                style={StyleSheet.absoluteFill}
            />
            {children}
        </Animated.View>
    );
});

// import React from 'react';
// import { View, StyleSheet, Platform } from 'react-native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { DashboardScreen } from '../screens/DashboardScreen';
// import { MoreScreen } from '../screens/MoreScreen';
// import { SettingsScreen } from '../screens/SettingsScreen';
// import { useTheme } from '../contexts/ThemeContext';
// import { Ionicons } from '@expo/vector-icons';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// const Tab = createBottomTabNavigator();

// export function BottomTabNavigator() {
//     const { colors, isDark } = useTheme();
//     const insets = useSafeAreaInsets();

//     const bottomMargin = insets.bottom > 0 ? insets.bottom + 10 : 24;

//     return (
//         <Tab.Navigator
//             screenOptions={{
//                 headerShown: false,
//                 sceneStyle: {
//                     backgroundColor: colors.background,
//                 },
//                 tabBarStyle: {
//                     position: 'absolute',
//                     bottom: bottomMargin,
//                     left: 25, // Fixed side margins
//                     right: 25,
//                     backgroundColor: colors.tabBarBackground,
//                     borderRadius: 30,
//                     height: 60,
//                     borderTopWidth: 0,
//                     elevation: 12,
//                     shadowColor: '#000',
//                     shadowOffset: { width: 0, height: 6 },
//                     shadowOpacity: isDark ? 0.4 : 0.1,
//                     shadowRadius: 12,
//                     paddingBottom: 0,
//                 },
//                 tabBarShowLabel: true,
//                 tabBarActiveTintColor: colors.primary,
//                 tabBarInactiveTintColor: colors.tabBarInactive,
//                 tabBarLabelStyle: { 
//                     fontSize: 10, 
//                     fontWeight: '700', 
//                     marginBottom: 10,
//                 },
//                 tabBarItemStyle: {
//                     height: 60,
//                     paddingTop: 8,
//                 },
//             }}
//         >
//             <Tab.Screen
//                 name="Dashboard"
//                 component={DashboardScreen}
//                 options={{
//                     tabBarLabel: 'Home',
//                     tabBarIcon: ({ focused, color }) => (
//                         <View style={[tabIconStyles.iconWrapper, focused && { backgroundColor: colors.primary + '12' }]}>
//                             <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
//                         </View>
//                     )
//                 }}
//             />
//             <Tab.Screen
//                 name="More"
//                 component={MoreScreen}
//                 options={{
//                     tabBarLabel: 'More',
//                     tabBarIcon: ({ focused, color }) => (
//                         <View style={[tabIconStyles.iconWrapper, focused && { backgroundColor: colors.primary + '12' }]}>
//                             <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />
//                         </View>
//                     )
//                 }}
//             />
//             <Tab.Screen
//                 name="Settings"
//                 component={SettingsScreen}
//                 options={{
//                     tabBarLabel: 'Settings',
//                     tabBarIcon: ({ focused, color }) => (
//                         <View style={[tabIconStyles.iconWrapper, focused && { backgroundColor: colors.primary + '12' }]}>
//                             <Ionicons name={focused ? 'settings' : 'settings-outline'} size={22} color={color} />
//                         </View>
//                     )
//                 }}
//             />
//         </Tab.Navigator>
//     );
// }

// const tabIconStyles = StyleSheet.create({
//     iconWrapper: {
//         width: 44,
//         height: 32,
//         borderRadius: 16,
//         alignItems: 'center',
//         justifyContent: 'center',
//     }
// });
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/DashboardScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

export function BottomTabNavigator() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();

    const bottomMargin = insets.bottom > 0 ? insets.bottom + 8 : 20; // 🔥 slightly reduced

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                sceneStyle: {
                    backgroundColor: colors.background,
                },

                tabBarStyle: {
    position: 'absolute',
    bottom: bottomMargin,

    width: '60%',            // 🔥 THIS fixes width
    left: '50%',                 // 🔥 move to center
    transform: [{ translateX: 80 }], // 🔥 shift back half width (IMPORTANT)

    backgroundColor: colors.tabBarBackground,
    borderRadius: 28,
    height: 60,

    borderTopWidth: 0,
    elevation: 10,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.35 : 0.08,
    shadowRadius: 8,

    paddingBottom: 4,
    paddingTop: 2,

    alignItems: 'center',
    justifyContent: 'center',
},

                tabBarShowLabel: true,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.tabBarInactive,

                tabBarLabelStyle: { 
                    fontSize: 10, 
                    fontWeight: '600', 
                    marginBottom: 4,   // 🔥 reduced (was 10)
                },

                tabBarItemStyle: {
                    height: 52,
                    paddingTop: 4,

                    flex: 0,
                    marginHorizontal: 10,
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ focused, color }) => (
                        <View style={[
                            tabIconStyles.iconWrapper,
                            focused && { backgroundColor: colors.primary + '12' }
                        ]}>
                            <Ionicons name={focused ? 'home' : 'home-outline'} size={20} color={color} />
                        </View>
                    )
                }}
            />

            <Tab.Screen
                name="More"
                component={MoreScreen}
                options={{
                    tabBarLabel: 'More',
                    tabBarIcon: ({ focused, color }) => (
                        <View style={[
                            tabIconStyles.iconWrapper,
                            focused && { backgroundColor: colors.primary + '12' }
                        ]}>
                            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={20} color={color} />
                        </View>
                    )
                }}
            />

            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Settings',
                    tabBarIcon: ({ focused, color }) => (
                        <View style={[
                            tabIconStyles.iconWrapper,
                            focused && { backgroundColor: colors.primary + '12' }
                        ]}>
                            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={20} color={color} />
                        </View>
                    )
                }}
            />
        </Tab.Navigator>
    );
}

const tabIconStyles = StyleSheet.create({
    iconWrapper: {
        width: 40,   // 🔥 slightly smaller
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
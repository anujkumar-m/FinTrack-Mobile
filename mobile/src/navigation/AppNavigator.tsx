import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { ExpensesScreen } from '../screens/ExpensesScreen';
import { IncomeScreen } from '../screens/IncomeScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { SavingsScreen } from '../screens/SavingsScreen';
import { CreditCardsScreen } from '../screens/CreditCardsScreen';
import { BillsScreen } from '../screens/BillsScreen';
import { BorrowLendScreen } from '../screens/BorrowLendScreen';
import { AllTransactionsScreen } from '../screens/AllTransactionsScreen';
import { AllDuesScreen } from '../screens/AllDuesScreen'; // Import the new screen
import { useTheme } from '../contexts/ThemeContext';

export type RootStackParamList = {
    MainTabs: undefined;
    AllTransactions: undefined;
    Expenses: undefined;
    Income: undefined;
    Analytics: undefined;
    Savings: undefined;
    Cards: undefined;
    Bills: undefined;
    Borrow: undefined;
    AllDues: undefined; // Add AllDues to the RootStackParamList
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
    const { colors } = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: 'slide_from_right',
                animationDuration: 280,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
            }}
        >
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen name="AllTransactions" component={AllTransactionsScreen} />
            <Stack.Screen name="Expenses" component={ExpensesScreen} />
            <Stack.Screen name="Income" component={IncomeScreen} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} />
            <Stack.Screen name="Savings" component={SavingsScreen} />
            <Stack.Screen name="Cards" component={CreditCardsScreen} />
            <Stack.Screen name="Bills" component={BillsScreen} />
            <Stack.Screen name="Borrow" component={BorrowLendScreen} />
            <Stack.Screen name="AllDues" component={AllDuesScreen} />
        </Stack.Navigator>
    );
}

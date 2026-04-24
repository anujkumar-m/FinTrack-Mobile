// Type definitions - matches web frontend types exactly
export interface Transaction {
    id: string;
    type: 'expense' | 'income';
    amount: number;
    description: string;
    category: string;
    date: string;
    paymentMode?: 'cash' | 'bank' | 'upi' | 'credit_card';
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: 'expense' | 'income' | 'both';
}

export interface Bill {
    id: string;
    name: string;
    amount: number;
    category: string;
    notes?: string;
    dueDate: string;
    isPaid: boolean;
    isRecurring: boolean;
}

export interface EMI {
    id: string;
    name: string;
    amount: number;
    startDate: string;
    endDate: string;
    isPaid: boolean;
}

export interface SavingsGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    icon: string;
}

export interface BorrowLend {
    id: string;
    type: 'borrowed' | 'lent';
    personName: string;
    amount: number;
    purpose: string;
    date: string;
    status: 'pending' | 'paid';
}

export interface CreditCard {
    id: string;
    name: string;
    lastFourDigits: string;
    billAmount: number;
    dueDate: string;
    isPaid: boolean;
}

export interface MonthlyStats {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    savings: number;
    month: string;
}

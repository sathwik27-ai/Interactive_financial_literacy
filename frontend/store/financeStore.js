// Zustand store for finance data
import { create } from 'zustand';

const useFinanceStore = create((set) => ({
  // State
  expenses: [],
  budgets: [],
  goals: [],
  isLoading: false,
  error: null,
  
  // Actions - Expenses
  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
  removeExpense: (id) => set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),
  
  // Actions - Budgets
  setBudgets: (budgets) => set({ budgets }),
  addBudget: (budget) => set((state) => ({ budgets: [budget, ...state.budgets] })),
  removeBudget: (id) => set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) })),
  
  // Actions - Goals
  setGoals: (goals) => set({ goals }),
  addGoal: (goal) => set((state) => ({ goals: [goal, ...state.goals] })),
  updateGoal: (id, updates) => set((state) => ({
    goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
  })),
  removeGoal: (id) => set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),
  
  // Loading and error
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

export default useFinanceStore;


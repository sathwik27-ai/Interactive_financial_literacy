// Zustand store for AI features
import { create } from 'zustand';

const useAIStore = create((set) => ({
  // State
  quizQuestions: [],
  quizHistory: [],
  chatMessages: [],
  isLoading: false,
  error: null,
  
  // Actions - Quiz
  setQuizQuestions: (questions) => set({ quizQuestions: questions }),
  clearQuiz: () => set({ quizQuestions: [] }),
  addQuizHistory: (quiz) => set((state) => ({ quizHistory: [quiz, ...state.quizHistory] })),
  setQuizHistory: (history) => set({ quizHistory: history }),
  
  // Actions - Chat
  setChatMessages: (messages) => set({ chatMessages: messages }),
  addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  clearChat: () => set({ chatMessages: [] }),
  
  // Loading and error
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

export default useAIStore;


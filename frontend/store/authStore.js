// Zustand store for authentication
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  // State
  user: null,
  token: null,
  isAuthenticated: false,
  
  // Actions
  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  updateUser: (user) => {
    set((state) => ({ user: { ...state.user, ...user } }));
  },
  
  initAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        set({ 
          user: JSON.parse(userStr), 
          token, 
          isAuthenticated: true 
        });
      }
    }
  }
}));

export default useAuthStore;

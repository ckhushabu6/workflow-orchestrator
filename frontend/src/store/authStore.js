import { create } from 'zustand';

const AUTH_STORAGE_KEY = 'workflow-auth';

const getStoredAuth = () => {
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    return storedAuth ? JSON.parse(storedAuth) : null;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

const persistAuth = ({ token, user }) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
};

const clearAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

const storedAuth = getStoredAuth();

export const useAuthStore = create((set) => ({
  token: storedAuth?.token || null,
  user: storedAuth?.user || null,
  isAuthenticated: Boolean(storedAuth?.token),
  isHydrated: true,

  setAuth: ({ token, user }) => {
    persistAuth({ token, user });
    set({
      token,
      user,
      isAuthenticated: Boolean(token),
    });
  },

  logout: () => {
    clearAuth();
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));

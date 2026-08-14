/*
 * SnapSell Marketplace – Frontend
 * File: src/context/AuthContext.jsx
 * Description: Stores the logged-in user and JWT in state + localStorage.
 *              Person 1 can build Login/Register/Profile pages on top of this.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { logoutUser } from '../api/authApi';

const AuthContext = createContext(null);

const TOKEN_KEY = 'snapsell_token';
const USER_KEY = 'snapsell_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  });

  /** Called after a successful login or register response. */
  const login = useCallback((userData, jwt) => {
    localStorage.setItem(TOKEN_KEY, jwt);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
  }, []);

  /** Clears session locally and tells the backend to invalidate the token. */
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // backend logout failure should not block the client-side clear
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Convenience hook – use this in any component to read auth state. */
export function useAuth() {
  return useContext(AuthContext);
}

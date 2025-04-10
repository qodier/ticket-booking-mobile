import { userService } from '@/services/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { User } from '@/types/user';
import { AxiosError } from 'axios';

interface AuthError {
  message: string;
  field?: 'email' | 'password' | null;
}

interface AuthContextProps {
  isLoggedIn: boolean;
  isLoadingAuth: boolean;
  authenticate: (authMode: "login" | "register", email: string, password: string) => Promise<void>;
  logout: VoidFunction;
  user: User | null;
  error: AuthError | null;
  clearError: VoidFunction;
}

const AuthContext = React.createContext({} as AuthContextProps);

export function useAuth() {
  return React.useContext(AuthContext);
}

export function AuthenticationProvider({ children }: React.PropsWithChildren) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    async function checkIfLoggedIn() {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');

      if (token && user) {
        setIsLoggedIn(true);
        setUser(JSON.parse(user));
        router.replace('(authed)');
      } else {
        setIsLoggedIn(false);
      }
    }

    checkIfLoggedIn();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const authenticate = useCallback(async (authMode: "login" | "register", email: string, password: string) => {
    try {
      setIsLoadingAuth(true);
      setError(null);

      // Basic validation
      if (!email.trim()) {
        setError({ message: "Email is required", field: "email" });
        return;
      }

      if (!password.trim()) {
        setError({ message: "Password is required", field: "password" });
        return;
      }

      if (password.length < 6) {
        setError({ message: "Password must be at least 6 characters", field: "password" });
        return;
      }

      const response = await userService[authMode](email, password);

      if (response) {
        setIsLoggedIn(true);
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        router.replace('(authed)');
      }
    } catch (error) {
      setIsLoggedIn(false);
      
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || 
          (authMode === 'login' ? 'Invalid credentials' : 'Registration failed');
        
        setError({ 
          message: errorMessage,
          field: errorMessage.toLowerCase().includes('email') ? 'email' : 
                 errorMessage.toLowerCase().includes('password') ? 'password' : null
        });
      } else {
        setError({ 
          message: 'Network error. Please check your connection.',
          field: null
        });
      }
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoggedIn(false);
    setUser(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    router.replace('/login');
  }, []);

  const contextValue = useMemo(() => ({
    authenticate,
    logout,
    isLoggedIn,
    isLoadingAuth,
    user,
    error,
    clearError
  }), [authenticate, logout, isLoggedIn, isLoadingAuth, user, error, clearError]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

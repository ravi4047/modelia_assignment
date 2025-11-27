// src/contexts/AuthContext.tsx

import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { User } from '../types';
import { AuthContext } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        console.log(error);
      }
    }
    setIsLoading(false);
  }, []);

    // Listen for app-level unauthorized events and navigate client-side
    useEffect(() => {
      const onUnauthorized = () => {
      // Clear client state
      setUser(null);

      // Only navigate if not already on an auth page
      const pathname = window.location.pathname;
      const authPaths = ['/login', '/signup'];

      if (!authPaths.includes(pathname)) {
        // Optionally show a message/toast here before navigating
        navigate('/login');
      } else {
        // already on login/signup - do nothing
        console.debug('onUnauthorized: already on auth page, skipping navigate');
      }
    };

    window.addEventListener('app:unauthorized', onUnauthorized);
    return () => window.removeEventListener('app:unauthorized', onUnauthorized);
  }, [navigate]);

  const login = async (email: string, password: string) => {
    const response = await apiService.login(email, password);
    const { token, userId } = response.data;

    localStorage.setItem('auth_token', token);
    const userData = { id: userId, email };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const signup = async (email: string, password: string) => {
    const response = await apiService.signup(email, password);
    const { token, userId } = response.data;

    localStorage.setItem('auth_token', token);
    const userData = { id: userId, email };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


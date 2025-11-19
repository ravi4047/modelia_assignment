// src/theme/ThemeProvider.tsx
import React, { useCallback, useState, useEffect } from 'react';
import { ThemeContext, type Theme } from '../hooks/useTheme';

const THEME_KEY = 'theme';

function safeGetStoredTheme(): Theme | null {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === 'dark' || raw === 'light') return raw;
    return null;
  } catch (err: unknown) {
    console.warn('ThemeProvider: read localStorage failed', err);
    return null;
  }
}

function safeSetStoredTheme(t: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch (err: unknown) {
    console.warn('ThemeProvider: write localStorage failed', err);
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeState, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    return safeGetStoredTheme() ?? 'light';
  });

  // Apply theme to DOM whenever themeState changes
  useEffect(() => {
    const root = document.documentElement;
    if (themeState === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    safeSetStoredTheme(themeState);
  }, [themeState]);

  const setTheme: React.Dispatch<React.SetStateAction<Theme>> = useCallback(
    (valueOrUpdater) => {
      setThemeState((prev) => {
        const next =
          typeof valueOrUpdater === 'function'
            ? (valueOrUpdater as (p: Theme) => Theme)(prev)
            : valueOrUpdater;
        return next;
      });
    },
    []
  );

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme: themeState, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};
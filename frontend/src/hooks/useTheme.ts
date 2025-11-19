import { createContext, useContext } from "react";

export type Theme = 'light' | 'dark';

export type ThemeContextType = {
  theme: Theme;
  // Accepts Theme or updater function (matches React setState signature)
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  toggle: () => void;
  // isSystem: boolean;
  // followSystem: () => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
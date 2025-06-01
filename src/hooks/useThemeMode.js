import { useContext } from 'react';
import { ThemeModeContext } from '../contexts/ThemeModeContext'; // Adjust path if needed

export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);
  if (context === undefined) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
};
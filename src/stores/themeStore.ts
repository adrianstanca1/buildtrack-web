import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  darkMode: boolean;
  toggle: () => void;
  setDarkMode: (val: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      darkMode: false,
      toggle: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (val) => set({ darkMode: val }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactElement, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => {},
});

const STORAGE_KEY = "tracehub-theme";

interface ThemeProviderProps {
  children: ReactNode;
  className?: string;
}

const ThemeProvider = ({ children }: ThemeProviderProps): ReactElement => {
  const [theme, setThemeState] = useState<Theme>("system");

  const applyTheme = useCallback((value: Theme) => {
    const isDark =
      value === "dark" ||
      (value === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const setTheme = useCallback(
    (value: Theme) => {
      setThemeState(value);
      localStorage.setItem(STORAGE_KEY, value);
      applyTheme(value);
    },
    [applyTheme],
  );

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial = stored ?? "system";
    setThemeState(initial);
    applyTheme(initial);
  }, [applyTheme]);

  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = (): ThemeContextValue => useContext(ThemeContext);

export { ThemeProvider, useTheme };
export type { Theme };

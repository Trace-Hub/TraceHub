"use client";

import type { ReactElement } from "react";
import { useTheme } from "@/shared/providers/ThemeProvider";
import type { Theme } from "@/shared/providers/ThemeProvider";
import { cn } from "@/shared/lib/utils";

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
  { value: "system", label: "시스템" },
];

interface ThemeSelectorProps {
  className?: string;
}

const ThemeSelector = ({ className }: ThemeSelectorProps): ReactElement => {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <h2 className="text-body1 font-medium text-text-secondary">테마 설정</h2>
      <div className="flex gap-2">
        {THEME_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={cn(
              "px-4 py-2 rounded-lg text-body2 font-medium transition-colors",
              theme === option.value
                ? "bg-primary text-white"
                : "bg-bg-hover text-text-secondary hover:text-text-primary",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;

"use client";

import { cn } from "@/shared/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";
  className?: string;
}

const variantConfig = {
  primary: "bg-primary hover:bg-primary-hover text-white border-transparent",
  secondary:
    "bg-bg-base hover:bg-bg-hover text-text-primary border-border-base",
  tertiary: "bg-transparent hover:bg-bg-hover text-error border-transparent",
} as const;

const Button = ({
  variant = "primary",
  className,
  disabled,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center",
        "px-4 py-2 rounded-md border",
        "text-body2 font-medium",
        "transition-[background-color,opacity] duration-150 ease",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
        variantConfig[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

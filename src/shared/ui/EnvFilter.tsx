"use client";

import {cn} from "@/shared/lib/utils";

type EnvFilterValue = "production" | "development";

interface EnvFilterProps {
    value: EnvFilterValue;
    onChange: (value: EnvFilterValue) => void;
    className?: string;
}

const ENV_OPTIONS: { value: EnvFilterValue; label: string }[] = [
    {value: "production", label: "production"},
    {value: "development", label: "development"},
];

const EnvFilter = ({
                       value,
                       onChange,
                       className,
                   }: EnvFilterProps): React.ReactElement => {
    const handleClick = (newValue: EnvFilterValue): void => {
        onChange(newValue);
    };

    return (
        <fieldset className={cn("flex items-center gap-1", className)}>
            <legend className="sr-only">환경 필터</legend>
            {ENV_OPTIONS.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    aria-pressed={value === option.value}
                    onClick={() => handleClick(option.value)}
                    className={cn(
                        "px-3 py-1.5 rounded-md",
                        "font-sans text-caption font-normal",
                        "transition-interactive transition-fast",
                        value === option.value
                            ? "bg-primary text-white hover:bg-primary-hover"
                            : "text-text-secondary hover:bg-bg-hover",
                    )}
                >
                    {option.label}
                </button>
            ))}
        </fieldset>
    );
};

export default EnvFilter;
export type {EnvFilterValue};

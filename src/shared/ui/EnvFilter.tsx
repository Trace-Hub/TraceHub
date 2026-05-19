"use client";

import {useState} from "react";
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
    const [selected, setSelected] = useState<EnvFilterValue>(value);

    const handleClick = (newValue: EnvFilterValue): void => {
        setSelected(newValue);
        onChange(newValue);
    };

    return (
        <div
            role="group"
            aria-label="환경 필터"
            className={cn("flex items-center gap-1", className)}
        >
            {ENV_OPTIONS.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected === option.value}
                    onClick={() => handleClick(option.value)}
                    className={cn(
                        "px-3 py-1.5 rounded-md",
                        "font-sans text-caption font-normal",
                        "transition-interactive transition-fast",
                        selected === option.value
                            ? "bg-primary text-white hover:bg-primary-hover"
                            : "text-text-secondary hover:bg-bg-hover",
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

export default EnvFilter;
export type {EnvFilterValue};

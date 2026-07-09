"use client";

import {cn} from "@/shared/lib/utils";
import EnvFilter from "@/shared/ui/EnvFilter";
import StatusFilter from "@/shared/ui/StatusFilter";
import type {EnvFilterValue} from "@/shared/ui/EnvFilter";
import type {StatusFilterValue} from "@/shared/ui/StatusFilter";

interface FilterBarProps {
    statusValue: StatusFilterValue;
    envValue: EnvFilterValue;
    onStatusChange: (value: StatusFilterValue) => void;
    onEnvChange: (value: EnvFilterValue) => void;
    className?: string;
}

const FilterBar = ({
                       statusValue,
                       envValue,
                       onStatusChange,
                       onEnvChange,
                       className,
                   }: FilterBarProps): React.ReactElement => {
    return (
        <div className={cn("flex items-center gap-2 border rounded-md border-border-base px-3 py-3", className)}>
            <StatusFilter value={statusValue} onChange={onStatusChange}/>
            <div className="w-px h-8 bg-border-base" aria-hidden="true"/>
            <EnvFilter value={envValue} onChange={onEnvChange}/>
        </div>
    );
};

export default FilterBar;

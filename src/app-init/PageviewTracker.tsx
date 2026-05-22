"use client";

import { trackPageview } from "@/shared/lib/posthog";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const PageviewTracker = (): null => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const url = `${window.location.origin}${pathname}`;
        trackPageview(url);
    }, [pathname, searchParams]);

    return null;
};

export default PageviewTracker;

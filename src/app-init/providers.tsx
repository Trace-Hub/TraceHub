"use client";

import posthog from "posthog-js";
import {PostHogProvider as PHProvider, usePostHog} from "posthog-js/react";
import {usePathname, useSearchParams} from "next/navigation";
import {Suspense, useEffect} from "react";

const PageviewTracker = (): null => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const ph = usePostHog();

    useEffect(() => {
        if (ph) {
            const url = `${window.location.origin}${pathname}`;
            ph.capture("$pageview", {$current_url: url});
        }
    }, [pathname, searchParams, ph]);

    return null;
};

const PostHogProvider = ({children}: { children: React.ReactNode }) => {
    return (
        <PHProvider client={posthog}>
            <Suspense>
                <PageviewTracker/>
            </Suspense>
            {children}
        </PHProvider>
    );
};

export default PostHogProvider;

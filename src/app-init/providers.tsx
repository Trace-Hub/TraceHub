"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { type ReactElement, type ReactNode, Suspense, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PageviewTracker from "@/app-init/PageviewTracker";

interface PostHogProviderProps {
  children: ReactNode;
}

const PostHogProvider = ({ children }: PostHogProviderProps): ReactElement => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <PHProvider client={posthog}>
        <Suspense>
          <PageviewTracker />
        </Suspense>
        {children}
      </PHProvider>
    </QueryClientProvider>
  );
};

export default PostHogProvider;

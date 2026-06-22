/** Shared React Query defaults — minimize idle and navigation refetches. */
export const CACHE_FOREVER = Number.POSITIVE_INFINITY;

export const QUERY_DEFAULTS = {
  refetchOnMount: false,
  retry: 1,
} as const;
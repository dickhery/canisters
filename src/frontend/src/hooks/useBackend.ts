import { createActor } from "@/backend";
import type {
  CanisterDetails,
  CanisterSummary,
  CreationCostEstimate,
  DashboardItem,
  E8s,
  Page,
  Page_1,
  UserAccount,
} from "@/backend.d";
import { useActor } from "@caffeineai/core-infrastructure";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20n;

export function useListCanisters(page: bigint) {
  const { actor } = useActor(createActor);
  // NOTE: We intentionally do NOT gate on `isFetching` here.
  // `isFetching` reflects actor re-initialisation which is a frontend concern
  // unrelated to data freshness. Gating on it causes queries to toggle off/on
  // and triggers a re-fetch that may return 0 cycle balances from the backend.
  // Gating on `!!actor` alone is sufficient — when there is no actor yet the
  // query simply waits; once the actor is ready it fetches once and stays live.
  return useQuery<Page>({
    queryKey: ["canisters", "list", page.toString()],
    queryFn: async () => {
      return actor!.listCanisters(page);
    },
    enabled: !!actor,
    staleTime: 60_000, // raised from 30s — reduces re-fetch frequency
    // keepPreviousData ensures the previous page stays visible while a new
    // page loads, but does NOT protect against 0-balance overwrites because
    // the query succeeds (returns data with 0s).  The `select` below handles
    // that separately.
    placeholderData: keepPreviousData,
    // One retry with a short delay is sufficient; immediate retry storms
    // just produce more 0-balance responses from the same transient error.
    retry: 1,
    retryDelay: 3_000,
  });
}

export function useGetCanisterDetails(canisterId: string | undefined) {
  const { actor } = useActor(createActor);
  return useQuery<CanisterDetails | null>({
    queryKey: ["canisters", "details", canisterId],
    queryFn: async () => {
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor!.getCanisterDetails(Principal.fromText(canisterId!));
    },
    // Same reasoning as useListCanisters — do not gate on isFetching.
    enabled: !!actor && !!canisterId,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    retry: 1,
    retryDelay: 3_000,
  });
}

export function useGetMyAccount() {
  const { actor } = useActor(createActor);
  return useQuery<UserAccount>({
    queryKey: ["account", "me"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getMyAccount();
    },
    enabled: !!actor,
    staleTime: 60_000,
  });
}

export function useGetMyBalance() {
  const { actor } = useActor(createActor);
  return useQuery<E8s>({
    queryKey: ["account", "balance"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getMyBalance();
    },
    enabled: !!actor,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useGetTransactionHistory(page: bigint) {
  const { actor } = useActor(createActor);
  return useQuery<Page_1>({
    queryKey: ["transactions", page.toString()],
    queryFn: async () => {
      if (!actor) return { total: 0n, page, pageSize: PAGE_SIZE, items: [] };
      return actor.getTransactionHistory(page);
    },
    enabled: !!actor,
    staleTime: 30_000,
  });
}

export function useGetAppPrincipal() {
  const { actor } = useActor(createActor);
  return useQuery<string>({
    queryKey: ["appPrincipal"],
    queryFn: async () => {
      if (!actor) return "";
      const principal = await actor.getAppPrincipal();
      return principal.toString();
    },
    enabled: !!actor,
    staleTime: 24 * 60 * 60 * 1_000, // 24 hours — it never changes
  });
}

export function useGetCreationCostEstimate(seedCyclesIcpE8s: number) {
  const { actor } = useActor(createActor);
  return useQuery<CreationCostEstimate>({
    queryKey: ["creationCostEstimate", seedCyclesIcpE8s],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getCreationCostEstimate(BigInt(seedCyclesIcpE8s));
    },
    enabled: !!actor,
    staleTime: 30_000,
  });
}

export function useGetRecentCanisters() {
  const { actor } = useActor(createActor);
  return useQuery<DashboardItem[]>({
    queryKey: ["dashboard", "recent"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecentCanisters();
    },
    enabled: !!actor,
    staleTime: 30_000,
    retry: 1,
    retryDelay: 3_000,
  });
}

export function useGetIcpXdrConversionRate() {
  const { actor } = useActor(createActor);
  return useQuery<bigint>({
    queryKey: ["icpXdrConversionRate"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getIcpXdrConversionRate();
    },
    enabled: !!actor,
    // Rate changes slowly — cache for 5 minutes before re-fetching
    staleTime: 5 * 60 * 1_000,
    retry: 1,
    retryDelay: 3_000,
  });
}

export function useGetLowestCyclesCanisters() {
  const { actor } = useActor(createActor);
  return useQuery<DashboardItem[]>({
    queryKey: ["dashboard", "lowest-cycles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLowestCyclesCanisters();
    },
    enabled: !!actor,
    staleTime: 30_000,
    retry: 1,
    retryDelay: 3_000,
  });
}

/**
 * Fetches ALL tracked canisters across every page and filters them client-side.
 * Enabled only when query.trim().length > 0.
 *
 * Strategy: fetch page 0 first to get the total count, then fan out to all
 * remaining pages in parallel, flatten, and filter — all inside one query so
 * React Query caches the full result set under the search key.
 */
export function useSearchCanisters(query: string) {
  const { actor } = useActor(createActor);
  const trimmed = query.trim();

  return useQuery<CanisterSummary[]>({
    queryKey: ["canisters", "search", trimmed],
    queryFn: async () => {
      if (!actor) return [];

      // 1. Fetch page 0 to get total count and first batch of items.
      const firstPage = await actor.listCanisters(0n);
      const total = Number(firstPage.total);
      const pageSize = Number(firstPage.pageSize || 20n);
      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      let allItems: CanisterSummary[] = [...firstPage.items];

      if (totalPages > 1) {
        // 2. Fan out remaining pages in parallel.
        const pageNums = Array.from({ length: totalPages - 1 }, (_, i) =>
          BigInt(i + 1),
        );
        const pages = await Promise.all(
          pageNums.map((p) => actor.listCanisters(p)),
        );
        for (const page of pages) {
          allItems = allItems.concat(page.items);
        }
      }

      // 3. Filter by query against name or canister ID.
      const q = trimmed.toLowerCase();
      return allItems.filter(
        (c) =>
          c.customName.toLowerCase().includes(q) ||
          c.canisterId.toString().toLowerCase().includes(q),
      );
    },
    enabled: !!actor && trimmed.length > 0,
    staleTime: 30_000,
    retry: 1,
    retryDelay: 3_000,
  });
}

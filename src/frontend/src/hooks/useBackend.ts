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
import { CanisterStatus } from "@/backend.d";
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
    // Refetch only on mount and after explicit invalidation (transfers, top-ups).
    staleTime: 120_000,
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
    staleTime: 120_000,
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
    staleTime: 5 * 60 * 1_000,
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
    staleTime: 5 * 60 * 1_000,
    retry: 1,
    retryDelay: 3_000,
  });
}

export function useGetTotalCycles() {
  const { actor } = useActor(createActor);
  return useQuery<bigint>({
    queryKey: ["dashboard", "total-cycles"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getTotalCycles();
    },
    enabled: !!actor,
    staleTime: 5 * 60 * 1_000,
    retry: 1,
    retryDelay: 3_000,
  });
}

export function useRecoverData() {
  const { actor } = useActor(createActor);
  return {
    actor,
    migrateFromPrincipal: async (
      oldPrincipalText: string,
    ): Promise<{ migrated: number }> => {
      if (!actor) throw new Error("Not connected");
      const { Principal } = await import("@icp-sdk/core/principal");
      const oldPrincipal = Principal.fromText(oldPrincipalText.trim());
      const result = await actor.migrateCanistersFromPrincipal(oldPrincipal);
      if (result.__kind__ === "err") throw new Error(result.err);
      return { migrated: Number(result.ok) };
    },
  };
}

/**
 * Calls actor.searchCanisters(queryText) directly — a single backend call that
 * filters all tracked canisters server-side and returns only matches.
 *
 * The backend returns CanisterInfo[] which lacks a few fields present on
 * CanisterSummary (status, fetchFailed, lastChecked).  We map them to safe
 * defaults so the existing CanisterRow component works unchanged.
 *
 * Enabled only when query.trim().length > 0.
 */
export function useSearchCanisters(query: string) {
  const { actor } = useActor(createActor);
  const trimmed = query.trim();

  return useQuery<CanisterSummary[]>({
    queryKey: ["canisters", "search", trimmed],
    queryFn: async () => {
      if (!actor) return [];

      // Single call — backend filters all pages server-side.
      const results = await actor.searchCanisters(trimmed);

      // Map CanisterInfo → CanisterSummary with safe defaults for fields that
      // the search endpoint doesn't return (they're available on detail fetch).
      return results.map((c) => ({
        canisterId: c.canisterId,
        customName: c.customName,
        cycleBalance: c.cachedCycleBalance,
        isController: c.isController,
        // CanisterInfo doesn't carry live status — use running as a safe default.
        // The detail page will show the real status once opened.
        status: CanisterStatus.running,
        fetchFailed: false,
        lastChecked: c.addedAt,
      }));
    },
    enabled: !!actor && trimmed.length > 0,
    staleTime: 60_000,
    retry: 1,
    retryDelay: 3_000,
  });
}

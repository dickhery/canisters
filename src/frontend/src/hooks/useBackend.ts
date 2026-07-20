import { createActor } from "@/backend";
import type {
  CanisterDetails,
  CanisterSummary,
  DashboardItem,
  E8s,
  FailedCreationView,
  Page,
  Page_1,
  UserAccount,
} from "@/backend.d";
import { CanisterStatus } from "@/backend.d";
import { useActor } from "@caffeineai/core-infrastructure";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CACHE_FOREVER, QUERY_DEFAULTS } from "./queryOptions";

const PAGE_SIZE = 20n;

type QueryEnabled = { enabled?: boolean };

export function useListCanisters(page: bigint) {
  const { actor } = useActor(createActor);
  return useQuery<Page>({
    queryKey: ["canisters", "list", page.toString()],
    queryFn: async () => {
      return actor!.listCanisters(page);
    },
    enabled: !!actor,
    staleTime: CACHE_FOREVER,
    ...QUERY_DEFAULTS,
    placeholderData: keepPreviousData,
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
    enabled: !!actor && !!canisterId,
    // Live status is expensive (management canister call) — cache aggressively.
    staleTime: 10 * 60 * 1_000,
    ...QUERY_DEFAULTS,
    placeholderData: keepPreviousData,
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
    staleTime: CACHE_FOREVER,
    ...QUERY_DEFAULTS,
  });
}

/**
 * Ledger balance fetch — costs cycles (update + inter-canister call).
 * Pass enabled:false on pages that can show cached balance instead.
 */
export function useGetMyBalance(options?: QueryEnabled) {
  const { actor } = useActor(createActor);
  const enabled = options?.enabled ?? true;
  return useQuery<E8s>({
    queryKey: ["account", "balance"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getMyBalance();
    },
    enabled: !!actor && enabled,
    staleTime: CACHE_FOREVER,
    ...QUERY_DEFAULTS,
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
    staleTime: CACHE_FOREVER,
    ...QUERY_DEFAULTS,
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
    staleTime: CACHE_FOREVER,
    ...QUERY_DEFAULTS,
  });
}

/**
 * CMC conversion rate — costs cycles (update + inter-canister call).
 * Defer with enabled:false until the user opens a top-up or create flow.
 */
export function useGetIcpXdrConversionRate(options?: QueryEnabled) {
  const { actor } = useActor(createActor);
  const enabled = options?.enabled ?? true;
  return useQuery<bigint>({
    queryKey: ["icpXdrConversionRate"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getIcpXdrConversionRate();
    },
    enabled: !!actor && enabled,
    staleTime: 60 * 60 * 1_000, // 1 hour — backend also caches
    ...QUERY_DEFAULTS,
    retryDelay: 3_000,
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
    staleTime: CACHE_FOREVER,
    ...QUERY_DEFAULTS,
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
    staleTime: CACHE_FOREVER,
    ...QUERY_DEFAULTS,
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
    staleTime: CACHE_FOREVER,
    ...QUERY_DEFAULTS,
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

/** Pending CMC create payments that failed after ICP left the account (query). */
export function useListFailedCreations(options?: QueryEnabled) {
  const { actor } = useActor(createActor);
  const enabled = options?.enabled ?? true;
  return useQuery<FailedCreationView[]>({
    queryKey: ["account", "failed-creations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFailedCreations();
    },
    enabled: !!actor && enabled,
    staleTime: 30_000,
    ...QUERY_DEFAULTS,
  });
}

export function useSearchCanisters(query: string) {
  const { actor } = useActor(createActor);
  const trimmed = query.trim();

  return useQuery<CanisterSummary[]>({
    queryKey: ["canisters", "search", trimmed],
    queryFn: async () => {
      if (!actor) return [];
      const results = await actor.searchCanisters(trimmed);
      return results.map((c) => ({
        canisterId: c.canisterId,
        customName: c.customName,
        cycleBalance: c.cachedCycleBalance,
        isController: c.isController,
        status: CanisterStatus.running,
        fetchFailed: false,
        lastChecked: c.addedAt,
      }));
    },
    enabled: !!actor && trimmed.length > 0,
    staleTime: CACHE_FOREVER,
    ...QUERY_DEFAULTS,
    retryDelay: 3_000,
  });
}
import { createActor } from "@/backend";
import type {
  CanisterDetails,
  E8s,
  Page,
  Page_1,
  UserAccount,
} from "@/backend.d";
import { useActor } from "@caffeineai/core-infrastructure";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20n;

export function useListCanisters(page: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Page>({
    queryKey: ["canisters", "list", page.toString()],
    queryFn: async () => {
      // No early-return with empty data — let `enabled` guard silence the query.
      // Returning empty items when !actor would overwrite real data during re-fetches.
      return actor!.listCanisters(page);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
    // Keep the last successful data visible while re-fetching (prevents flash to 0)
    placeholderData: keepPreviousData,
  });
}

export function useGetCanisterDetails(canisterId: string | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<CanisterDetails | null>({
    queryKey: ["canisters", "details", canisterId],
    queryFn: async () => {
      // No early-return with null — let `enabled` guard silence the query.
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor!.getCanisterDetails(Principal.fromText(canisterId!));
    },
    enabled: !!actor && !isFetching && !!canisterId,
    staleTime: 30_000,
    // Keep previous details while re-fetching so controller badge doesn't flicker
    placeholderData: keepPreviousData,
  });
}

export function useGetMyAccount() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<UserAccount>({
    queryKey: ["account", "me"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getMyAccount();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useGetMyBalance() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<E8s>({
    queryKey: ["account", "balance"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getMyBalance();
    },
    enabled: !!actor && !isFetching,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useGetTransactionHistory(page: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Page_1>({
    queryKey: ["transactions", page.toString()],
    queryFn: async () => {
      if (!actor) return { total: 0n, page, pageSize: PAGE_SIZE, items: [] };
      return actor.getTransactionHistory(page);
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetAppPrincipal() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<string>({
    queryKey: ["appPrincipal"],
    queryFn: async () => {
      if (!actor) return "";
      const principal = await actor.getAppPrincipal();
      return principal.toString();
    },
    enabled: !!actor && !isFetching,
    staleTime: 24 * 60 * 60 * 1_000, // 24 hours — it never changes
  });
}

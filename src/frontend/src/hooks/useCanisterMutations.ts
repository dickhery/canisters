import { createActor } from "@/backend";
import type { E8s } from "@/backend.d";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAddCanister() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      canisterId,
      customName,
    }: {
      canisterId: string;
      customName: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const { Principal } = await import("@icp-sdk/core/principal");
      const result = await actor.addCanister(
        Principal.fromText(canisterId),
        customName,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canisters"] });
      toast.success("Canister added successfully");
    },
    onError: (err: Error) => {
      toast.error("Failed to add canister", { description: err.message });
    },
  });
}

export function useRemoveCanister() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (canisterId: string) => {
      if (!actor) throw new Error("Not connected");
      const { Principal } = await import("@icp-sdk/core/principal");
      const result = await actor.removeCanister(Principal.fromText(canisterId));
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canisters"] });
      toast.success("Canister removed");
    },
    onError: (err: Error) => {
      toast.error("Failed to remove canister", { description: err.message });
    },
  });
}

export function useRenameCanister() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      canisterId,
      newName,
    }: {
      canisterId: string;
      newName: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const { Principal } = await import("@icp-sdk/core/principal");
      const result = await actor.renameCanister(
        Principal.fromText(canisterId),
        newName,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["canisters"] });
      queryClient.invalidateQueries({
        queryKey: ["canisters", "details", variables.canisterId],
      });
      toast.success("Canister renamed");
    },
    onError: (err: Error) => {
      toast.error("Failed to rename canister", { description: err.message });
    },
  });
}

export function useAddController() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      canisterId,
      controller,
    }: {
      canisterId: string;
      controller: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const { Principal } = await import("@icp-sdk/core/principal");
      const result = await actor.addController(
        Principal.fromText(canisterId),
        Principal.fromText(controller),
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["canisters", "details", variables.canisterId],
      });
      toast.success("Controller added");
    },
    onError: (err: Error) => {
      toast.error("Failed to add controller", { description: err.message });
    },
  });
}

export function useRemoveController() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      canisterId,
      controller,
    }: {
      canisterId: string;
      controller: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const { Principal } = await import("@icp-sdk/core/principal");
      const result = await actor.removeController(
        Principal.fromText(canisterId),
        Principal.fromText(controller),
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["canisters", "details", variables.canisterId],
      });
      toast.success("Controller removed");
    },
    onError: (err: Error) => {
      toast.error("Failed to remove controller", { description: err.message });
    },
  });
}

export function useTopUpCanister() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      canisterId,
      icpAmountE8s,
    }: {
      canisterId: string;
      icpAmountE8s: E8s;
    }) => {
      if (!actor) throw new Error("Not connected");
      const { Principal } = await import("@icp-sdk/core/principal");
      const result = await actor.topUpCanister(
        Principal.fromText(canisterId),
        icpAmountE8s,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (_cycles, variables) => {
      queryClient.invalidateQueries({ queryKey: ["canisters"] });
      queryClient.invalidateQueries({
        queryKey: ["canisters", "details", variables.canisterId],
      });
      queryClient.invalidateQueries({ queryKey: ["account", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Canister topped up successfully");
    },
    onError: (err: Error) => {
      toast.error("Top-up failed", { description: err.message });
    },
  });
}

export function useTransferIcp() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      toAccountId,
      amountE8s,
      memo,
    }: {
      toAccountId: string;
      amountE8s: E8s;
      memo: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.transferIcp(toAccountId, amountE8s, memo);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("ICP transfer successful");
    },
    onError: (err: Error) => {
      toast.error("Transfer failed", { description: err.message });
    },
  });
}

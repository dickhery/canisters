import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CanisterInfo {
    cachedCycleBalance: Cycles;
    addedAt: Timestamp;
    customName: string;
    isController: boolean;
    lastInteractedAt: Timestamp;
    canisterId: CanisterId;
}
export type Timestamp = bigint;
export type Result_2 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export interface CanisterDetails {
    status: CanisterStatus;
    controllers: Array<Principal>;
    cycleBalance: Cycles;
    createdAt: Timestamp;
    customName: string;
    lastChecked: Timestamp;
    fetchFailed: boolean;
    canisterId: CanisterId;
}
export interface UserAccount {
    accountId: string;
    userId: UserId;
    subaccount: Uint8Array;
}
export type TxKind = {
    __kind__: "topUp";
    topUp: {
        cyclesAdded: Cycles;
        canisterId: Principal;
    };
} | {
    __kind__: "icpTransfer";
    icpTransfer: {
        toAccountId: string;
    };
};
export interface Page_1 {
    total: bigint;
    page: bigint;
    pageSize: bigint;
    items: Array<Transaction>;
}
export type Result_1 = {
    __kind__: "ok";
    ok: Cycles;
} | {
    __kind__: "err";
    err: string;
};
export interface CreateCanisterResult {
    cyclesSeeded: Cycles;
    canisterId: CanisterId;
}
export interface Transaction {
    id: bigint;
    userId: UserId;
    kind: TxKind;
    memo: string;
    timestamp: Timestamp;
    amountE8s: E8s;
}
export type UserId = Principal;
export interface DashboardItem {
    cycleBalance: Cycles;
    customName: string;
    isController: boolean;
    lastInteractedAt: Timestamp;
    canisterId: CanisterId;
}
export type Result = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "err";
    err: string;
};
export type Result_3 = {
    __kind__: "ok";
    ok: CreateCanisterResult;
} | {
    __kind__: "err";
    err: string;
};
export interface Page {
    total: bigint;
    page: bigint;
    pageSize: bigint;
    items: Array<CanisterSummary>;
}
export type E8s = bigint;
export type Cycles = bigint;
export interface CreationCostEstimate {
    creationFeeIcpE8s: E8s;
    creationCycles: Cycles;
    cyclesPerIcp: bigint;
    estimatedSeedCycles: Cycles;
    transferFeeE8s: E8s;
    seedCyclesIcpE8s: E8s;
    totalIcpRequiredE8s: E8s;
}
export interface CanisterSummary {
    status: CanisterStatus;
    cycleBalance: Cycles;
    customName: string;
    lastChecked: Timestamp;
    isController: boolean;
    fetchFailed: boolean;
    canisterId: CanisterId;
}
export type CanisterId = Principal;
export enum CanisterStatus {
    stopped = "stopped",
    stopping = "stopping",
    running = "running"
}
export interface backendInterface {
    addCanister(canisterId: CanisterId, customName: string): Promise<Result_2>;
    addController(canisterId: CanisterId, controller: Principal): Promise<Result_2>;
    createCanister(name: string, seedCyclesIcpE8s: E8s): Promise<Result_3>;
    getAppPrincipal(): Promise<Principal>;
    getCanisterDetails(canisterId: CanisterId): Promise<CanisterDetails | null>;
    getCreationCostEstimate(seedCyclesIcpE8s: E8s): Promise<CreationCostEstimate>;
    getIcpXdrConversionRate(): Promise<bigint>;
    getLowestCyclesCanisters(): Promise<Array<DashboardItem>>;
    getMyAccount(): Promise<UserAccount>;
    getMyBalance(): Promise<E8s>;
    getRecentCanisters(): Promise<Array<DashboardItem>>;
    getTransactionHistory(page: bigint): Promise<Page_1>;
    listCanisters(page: bigint): Promise<Page>;
    removeCanister(canisterId: CanisterId): Promise<Result_2>;
    removeController(canisterId: CanisterId, controller: Principal): Promise<Result_2>;
    renameCanister(canisterId: CanisterId, newName: string): Promise<Result_2>;
    searchCanisters(queryText: string): Promise<Array<CanisterInfo>>;
    topUpCanister(canisterId: CanisterId, icpAmountE8s: E8s): Promise<Result_1>;
    transferIcp(toAccountId: string, amountE8s: E8s, memo: string): Promise<Result>;
}

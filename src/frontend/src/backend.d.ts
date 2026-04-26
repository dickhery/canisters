import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface Transaction {
    id: bigint;
    userId: UserId;
    kind: TxKind;
    memo: string;
    timestamp: Timestamp;
    amountE8s: E8s;
}
export type UserId = Principal;
export type Cycles = bigint;
export type Result = {
    __kind__: "ok";
    ok: bigint;
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
export type CanisterId = Principal;
export interface CanisterSummary {
    status: CanisterStatus;
    cycleBalance: Cycles;
    customName: string;
    lastChecked: Timestamp;
    canisterId: CanisterId;
}
export enum CanisterStatus {
    stopped = "stopped",
    stopping = "stopping",
    running = "running"
}
export interface backendInterface {
    addCanister(canisterId: CanisterId, customName: string): Promise<Result_2>;
    addController(canisterId: CanisterId, controller: Principal): Promise<Result_2>;
    getAppPrincipal(): Promise<Principal>;
    getCanisterDetails(canisterId: CanisterId): Promise<CanisterDetails | null>;
    getMyAccount(): Promise<UserAccount>;
    getMyBalance(): Promise<E8s>;
    getTransactionHistory(page: bigint): Promise<Page_1>;
    listCanisters(page: bigint): Promise<Page>;
    removeCanister(canisterId: CanisterId): Promise<Result_2>;
    removeController(canisterId: CanisterId, controller: Principal): Promise<Result_2>;
    renameCanister(canisterId: CanisterId, newName: string): Promise<Result_2>;
    topUpCanister(canisterId: CanisterId, icpAmountE8s: E8s): Promise<Result_1>;
    transferIcp(toAccountId: string, amountE8s: E8s, memo: string): Promise<Result>;
}

import type { backendInterface, CanisterDetails, CanisterSummary, Page, Page_1, UserAccount } from "../backend";
import { CanisterStatus } from "../backend";
import { Principal } from "@icp-sdk/core/principal";

const pid1 = Principal.fromText("5n6t7-oaaaa-aaaaa-qaava-cai");
const pid2 = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
const pid3 = Principal.fromText("rdmx6-jaaaa-aaaaa-aaadq-cai");
const pid4 = Principal.fromText("r7inp-6aaaa-aaaaa-aaabq-cai");
const pid5 = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");

const sampleCanisters: CanisterSummary[] = [
  { canisterId: pid1, customName: "Ledger Service", status: CanisterStatus.running, cycleBalance: BigInt("1800000000000"), lastChecked: BigInt(Date.now() * 1_000_000 - 3 * 3600 * 1_000_000_000) },
  { canisterId: pid2, customName: "Identity Provider", status: CanisterStatus.stopped, cycleBalance: BigInt("950000000000"), lastChecked: BigInt(Date.now() * 1_000_000 - 6 * 3600 * 1_000_000_000) },
  { canisterId: pid3, customName: "Asset Storage", status: CanisterStatus.stopping, cycleBalance: BigInt("1800000000000"), lastChecked: BigInt(Date.now() * 1_000_000 - 1 * 3600 * 1_000_000_000) },
  { canisterId: pid4, customName: "Arsoo Sporace", status: CanisterStatus.running, cycleBalance: BigInt("950000000000"), lastChecked: BigInt(Date.now() * 1_000_000 - 12 * 3600 * 1_000_000_000) },
  { canisterId: pid5, customName: "Orbit Aaolt", status: CanisterStatus.stopped, cycleBalance: BigInt("950000000000"), lastChecked: BigInt(Date.now() * 1_000_000 - 2 * 3600 * 1_000_000_000) },
  { canisterId: pid1, customName: "Suger Service", status: CanisterStatus.running, cycleBalance: BigInt("950000000000"), lastChecked: BigInt(Date.now() * 1_000_000 - 8 * 3600 * 1_000_000_000) },
  { canisterId: pid2, customName: "Canister Creator", status: CanisterStatus.stopping, cycleBalance: BigInt("950000000000"), lastChecked: BigInt(Date.now() * 1_000_000 - 15 * 3600 * 1_000_000_000) },
  { canisterId: pid3, customName: "Backend Core", status: CanisterStatus.running, cycleBalance: BigInt("2100000000000"), lastChecked: BigInt(Date.now() * 1_000_000 - 4 * 3600 * 1_000_000_000) },
];

const sampleDetails: CanisterDetails = {
  canisterId: pid1,
  customName: "Ledger Service",
  status: CanisterStatus.running,
  cycleBalance: BigInt("1800000000000"),
  controllers: [pid1, pid2],
  createdAt: BigInt(Date.now() * 1_000_000 - 30 * 24 * 3600 * 1_000_000_000),
  lastChecked: BigInt(Date.now() * 1_000_000 - 3 * 3600 * 1_000_000_000),
};

const sampleAccount: UserAccount = {
  userId: pid1,
  accountId: "a5d9e2c3f1b4d6e7a8c0f2b3d5e6a7c8d9b0e1f2a3b4c5d6e7f8a9b0c1d2e3f4",
  subaccount: new Uint8Array(32),
};

export const mockBackend: backendInterface = {
  addCanister: async (_canisterId, _customName) => ({ __kind__: "ok", ok: null }),
  addController: async (_canisterId, _controller) => ({ __kind__: "ok", ok: null }),
  getAppPrincipal: async () => Principal.fromText("cnlze-ciaaa-aaaap-qp47a-cai"),
  getCanisterDetails: async (_canisterId): Promise<CanisterDetails | null> => sampleDetails,
  getMyAccount: async (): Promise<UserAccount> => sampleAccount,
  getMyBalance: async () => BigInt("7843000000"),
  getTransactionHistory: async (_page): Promise<Page_1> => ({
    total: BigInt(6),
    page: BigInt(1),
    pageSize: BigInt(20),
    items: [
      {
        id: BigInt(6),
        userId: pid1,
        kind: { __kind__: "topUp", topUp: { cyclesAdded: BigInt("500000000000"), canisterId: pid1 } },
        memo: "Top up Ledger Service",
        timestamp: BigInt(Date.now() * 1_000_000 - 3 * 3600 * 1_000_000_000),
        amountE8s: BigInt("50000000"),
      },
      {
        id: BigInt(5),
        userId: pid1,
        kind: { __kind__: "icpTransfer", icpTransfer: { toAccountId: "b6e0f3a4c2d5e8f9a1b2c3d4e5f6a7b8" } },
        memo: "Transfer to external wallet",
        timestamp: BigInt(Date.now() * 1_000_000 - 12 * 3600 * 1_000_000_000),
        amountE8s: BigInt("100000000"),
      },
      {
        id: BigInt(4),
        userId: pid1,
        kind: { __kind__: "topUp", topUp: { cyclesAdded: BigInt("1000000000000"), canisterId: pid2 } },
        memo: "Top up Identity Provider",
        timestamp: BigInt(Date.now() * 1_000_000 - 24 * 3600 * 1_000_000_000),
        amountE8s: BigInt("100000000"),
      },
      {
        id: BigInt(3),
        userId: pid1,
        kind: { __kind__: "topUp", topUp: { cyclesAdded: BigInt("500000000000"), canisterId: pid3 } },
        memo: "Top up Asset Storage",
        timestamp: BigInt(Date.now() * 1_000_000 - 2 * 24 * 3600 * 1_000_000_000),
        amountE8s: BigInt("50000000"),
      },
    ],
  }),
  listCanisters: async (_page): Promise<Page> => ({
    total: BigInt(sampleCanisters.length),
    page: BigInt(1),
    pageSize: BigInt(20),
    items: sampleCanisters,
  }),
  removeCanister: async (_canisterId) => ({ __kind__: "ok", ok: null }),
  removeController: async (_canisterId, _controller) => ({ __kind__: "ok", ok: null }),
  renameCanister: async (_canisterId, _newName) => ({ __kind__: "ok", ok: null }),
  topUpCanister: async (_canisterId, _icpAmountE8s) => ({ __kind__: "ok", ok: BigInt("500000000000") }),
  transferIcp: async (_toAccountId, _amountE8s, _memo) => ({ __kind__: "ok", ok: BigInt(42) }),
};

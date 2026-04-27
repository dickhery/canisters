import Nat64 "mo:core/Nat64";
import CommonTypes "../types/common";
import CreationTypes "../types/canister-creation";

// Domain helpers for the canister-creation flow.
// All business logic lives in the mixin; this module provides
// pure helper functions (cost estimation, constant definitions).
module {
  // 500 billion cycles — the creation fee paid from the APP's own cycle balance.
  // This is NOT charged to the user in ICP; the app canister absorbs this cost.
  public let CREATION_FEE_CYCLES : Nat = 500_000_000_000;

  // ICP ledger transfer fee: 10_000 e8s = 0.0001 ICP
  public let ICP_FEE_E8S : Nat64 = 10_000;

  // ICP charged to the USER for canister creation = 0.
  // The IC management canister deducts 500B cycles directly from the app's
  // cycle balance — no ICP transfer is required from the user's sub-account.
  // The user only needs ICP if they want to seed the new canister with cycles.
  public let CREATION_ICP_FEE_E8S : Nat64 = 0;

  // Default cycles-per-ICP rate used as a fallback when the CMC is unavailable.
  // 1 ICP ≈ 10 XDR at ~13,000 XDR/ICP; 1 XDR = 1T cycles.
  // xdr_permyriad_per_icp ≈ 100_000 (10 XDR * 10_000), so cycles_per_icp ≈ 10_000_000_000_000.
  public let DEFAULT_CYCLES_PER_ICP : Nat = 10_000_000_000_000;

  // Convert xdr_permyriad_per_icp (as returned by CMC) to cycles per ICP.
  // Formula: cycles_per_icp = xdr_permyriad_per_icp * 100_000_000
  // Because: 1 XDR = 1_000_000_000_000 cycles, and xdr_permyriad_per_icp is in units of 0.0001 XDR/ICP.
  // So: (xdr_permyriad_per_icp / 10_000) XDR/ICP * 1_000_000_000_000 cycles/XDR
  //   = xdr_permyriad_per_icp * 100_000_000 cycles/ICP
  public func xdrPermyriadToCyclesPerIcp(xdrPermyriad : Nat64) : Nat {
    xdrPermyriad.toNat() * 100_000_000
  };

  // Compute the upfront cost estimate shown to the user before they confirm.
  // seedCyclesIcpE8s = 0 means no seed top-up requested.
  // cyclesPerIcp = live rate from CMC (use DEFAULT_CYCLES_PER_ICP if unavailable).
  //
  // Cost breakdown:
  //   - Canister creation itself: FREE for the user (app pays 500B cycles from its balance)
  //   - Seed top-up (if requested): seedCyclesIcpE8s ICP, plus one transfer fee of 10_000 e8s
  //   - Total ICP the user must have in their sub-account:
  //       0                          (no seeding)
  //       seedCyclesIcpE8s + 10_000  (seeding requested)
  public func estimateCreationCost(
    seedCyclesIcpE8s : CommonTypes.E8s,
    cyclesPerIcp : Nat,
  ) : CreationTypes.CreationCostEstimate {
    let totalIcpRequiredE8s : Nat64 = if (seedCyclesIcpE8s > 0) {
      seedCyclesIcpE8s + ICP_FEE_E8S  // seed amount + one transfer fee
    } else {
      0  // creation is free for the user when no seeding is requested
    };
    // Estimate how many cycles the seed ICP will buy using the live rate.
    // seedNetE8s is the amount actually sent to CMC (after deducting the transfer fee).
    let estimatedSeedCycles : Nat = if (seedCyclesIcpE8s > ICP_FEE_E8S) {
      let seedNetE8s = (seedCyclesIcpE8s - ICP_FEE_E8S).toNat();
      // seedNetE8s / 1e8 ICP * cyclesPerIcp
      seedNetE8s * cyclesPerIcp / 100_000_000
    } else { 0 };
    {
      creationFeeIcpE8s    = CREATION_ICP_FEE_E8S; // 0 — app pays cycles, not user ICP
      transferFeeE8s       = ICP_FEE_E8S;
      totalIcpRequiredE8s  = totalIcpRequiredE8s;
      seedCyclesIcpE8s     = seedCyclesIcpE8s;
      creationCycles       = CREATION_FEE_CYCLES;
      estimatedSeedCycles  = estimatedSeedCycles;
      cyclesPerIcp         = cyclesPerIcp;
    }
  };
};

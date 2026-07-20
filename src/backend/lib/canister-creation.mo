import Nat64 "mo:core/Nat64";
import CommonTypes "../types/common";
import CreationTypes "../types/canister-creation";

// Domain helpers for the canister-creation flow.
// All business logic lives in the mixin; this module provides
// pure helper functions (cost estimation, constant definitions).
module {
  // IC canister creation fee deducted (in cycles) by the protocol when a
  // canister is created via the CMC. User pays this in ICP via CMC conversion
  // — the app canister does NOT attach its own cycles.
  public let CREATION_FEE_CYCLES : Nat = 500_000_000_000;

  // Minimum residual cycles left on a brand-new empty canister after the
  // creation fee. Empty canisters still need cycles to allocate initial
  // memory pages (~12 KiB ≈ 26B cycles); 100B leaves a small safe buffer
  // without over-funding.
  public let MIN_INITIAL_CYCLES : Nat = 100_000_000_000;

  // Total cycles that the ICP payment must mint at minimum:
  // creation fee (500B) + residual (100B) so create does not fail on memory grow.
  // Literal (not sum) — Motoko modules require static expressions for top-level lets.
  public let MIN_CREATE_CYCLES : Nat = 600_000_000_000;

  // ICP ledger transfer fee: 10_000 e8s = 0.0001 ICP
  public let ICP_FEE_E8S : Nat64 = 10_000;

  // Memo used on create payments to the CMC ("CREA" as big-endian ASCII).
  // Used to identify recoverable create transfers on the ICP ledger.
  public let CREA_MEMO : Nat64 = 0x43524541;

  // Fallback minimum ICP charged for creation when rate is unavailable.
  // ~0.5 ICP covers ≥600B cycles at typical mainnet rates (~1.5T cycles/ICP).
  public let FALLBACK_MIN_CREATION_ICP_E8S : Nat64 = 50_000_000;

  // Default cycles-per-ICP rate used as a fallback when the CMC is unavailable.
  // Slightly below typical mainnet rates so estimates do not overpromise.
  public let DEFAULT_CYCLES_PER_ICP : Nat = 1_500_000_000_000;

  // Convert xdr_permyriad_per_icp (as returned by CMC) to cycles per ICP.
  // Formula: cycles_per_icp = xdr_permyriad_per_icp * 100_000_000
  // Because: 1 XDR = 1_000_000_000_000 cycles, and xdr_permyriad_per_icp is in units of 0.0001 XDR/ICP.
  // So: (xdr_permyriad_per_icp / 10_000) XDR/ICP * 1_000_000_000_000 cycles/XDR
  //   = xdr_permyriad_per_icp * 100_000_000 cycles/ICP
  public func xdrPermyriadToCyclesPerIcp(xdrPermyriad : Nat64) : Nat {
    xdrPermyriad.toNat() * 100_000_000
  };

  // Minimum ICP (gross) the user must hold/spend so that after the ledger fee
  // the CMC still receives enough ICP to mint MIN_CREATE_CYCLES.
  // Adds a 5% buffer against rate movement. Gross = net + transfer fee.
  // When cyclesPerIcp is 0, returns the conservative fallback.
  public func minCreationIcpE8s(cyclesPerIcp : Nat) : Nat64 {
    if (cyclesPerIcp == 0) {
      return FALLBACK_MIN_CREATION_ICP_E8S
    };
    // ceil(MIN_CREATE_CYCLES * 1e8 / cyclesPerIcp) without (b - 1) subtraction
    // so moc does not warn about a trapping Nat operator (M0155).
    let dividend = MIN_CREATE_CYCLES * 100_000_000;
    let quotient = dividend / cyclesPerIcp;
    let raw = if (dividend % cyclesPerIcp == 0) {
      quotient
    } else {
      quotient + 1
    };
    let withBuffer = raw + raw / 20; // +5%
    // Gross amount matches topUpCanister: user pays net + ledger fee
    let gross = withBuffer + ICP_FEE_E8S.toNat();
    // Never go below the fallback so a high rate cannot underfund creation.
    let minNat = if (gross < FALLBACK_MIN_CREATION_ICP_E8S.toNat()) {
      FALLBACK_MIN_CREATION_ICP_E8S.toNat()
    } else {
      gross
    };
    // minNat is an ICP e8s amount (<< 2^64). Split so each half fits Nat32 range
    // and Nat64.fromNat cannot trap on a large Nat (M0155).
    let lo = minNat % 4_294_967_296;
    let hi = minNat / 4_294_967_296;
    Nat64.fromNat(hi) * 4_294_967_296 + Nat64.fromNat(lo)
  };

  // Compute the upfront cost estimate shown to the user before they confirm.
  // seedCyclesIcpE8s = additional ICP beyond the base creation minimum.
  // cyclesPerIcp = live rate from CMC (use DEFAULT_CYCLES_PER_ICP if unavailable).
  //
  // Cost breakdown (user-funded via CMC — app attaches 0 cycles):
  //   - Base creation ICP: min ICP that mints CREATION_FEE + MIN_INITIAL cycles
  //   - Optional seed ICP: extra ICP the user chooses to fund the new canister
  //   - One ledger transfer fee is included in the top-up-style gross amount:
  //       net_to_CMC = totalIcpRequiredE8s - ICP_FEE_E8S
  //       (same pattern as topUpCanister)
  public func estimateCreationCost(
    seedCyclesIcpE8s : CommonTypes.E8s,
    cyclesPerIcp : Nat,
  ) : CreationTypes.CreationCostEstimate {
    let creationFeeIcpE8s = minCreationIcpE8s(cyclesPerIcp);
    // Gross ICP the user must have: base creation + optional extra seed.
    // Matches topUpCanister: balance check uses gross; transfer sends gross - fee.
    let totalIcpRequiredE8s : Nat64 = creationFeeIcpE8s + seedCyclesIcpE8s;

    // Estimate cycles the new canister receives after the protocol creation fee.
    let estimatedSeedCycles : Nat = if (totalIcpRequiredE8s > ICP_FEE_E8S) {
      let netE8s = (totalIcpRequiredE8s - ICP_FEE_E8S).toNat();
      let minted = netE8s * cyclesPerIcp / 100_000_000;
      if (minted > CREATION_FEE_CYCLES) {
        minted - CREATION_FEE_CYCLES
      } else {
        0
      }
    } else {
      0
    };

    {
      creationFeeIcpE8s;
      transferFeeE8s = ICP_FEE_E8S;
      totalIcpRequiredE8s;
      seedCyclesIcpE8s;
      creationCycles = CREATION_FEE_CYCLES;
      estimatedSeedCycles;
      cyclesPerIcp;
    }
  };
};

import CommonTypes "common";

module {
  public type UserId = CommonTypes.UserId;
  public type CanisterId = CommonTypes.CanisterId;
  public type E8s = CommonTypes.E8s;
  public type Cycles = CommonTypes.Cycles;

  // Arguments for creating a new canister
  public type CreateCanisterArgs = {
    name : Text;
    seedCyclesIcpE8s : E8s; // 0 means no initial top-up; creation fee still applies
  };

  // Successful result of canister creation
  public type CreateCanisterResult = {
    canisterId : CanisterId;
    cyclesSeeded : Cycles; // 0 if no seed top-up was requested
  };

  // Cost breakdown shown upfront to the user before committing
  public type CreationCostEstimate = {
    creationFeeIcpE8s : E8s;       // ICP charged to USER for creation — always 0 (app pays 500B cycles from its own balance)
    transferFeeE8s : E8s;          // ICP ledger fee per transfer (10_000 e8s)
    totalIcpRequiredE8s : E8s;     // Total ICP user must have: 0 if no seeding, else seedCyclesIcpE8s + transferFeeE8s
    seedCyclesIcpE8s : E8s;        // Passthrough of the user's requested seed amount
    creationCycles : Cycles;       // 500B cycles deducted from app's own balance for IC create_canister call
    estimatedSeedCycles : Cycles;  // Estimated cycles the seed ICP will buy at the live CMC rate
    cyclesPerIcp : Nat;            // Live ICP→cycles rate used for the estimate (cycles per 1 ICP)
  };
};

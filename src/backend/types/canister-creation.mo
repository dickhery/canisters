import CommonTypes "common";

module {
  public type UserId = CommonTypes.UserId;
  public type CanisterId = CommonTypes.CanisterId;
  public type E8s = CommonTypes.E8s;
  public type Cycles = CommonTypes.Cycles;

  // Arguments for creating a new canister
  public type CreateCanisterArgs = {
    name : Text;
    // Additional ICP beyond the base CMC creation minimum (0 = base only).
    seedCyclesIcpE8s : E8s;
  };

  // Successful result of canister creation
  public type CreateCanisterResult = {
    canisterId : CanisterId;
    // Estimated residual cycles on the new canister after creation fee
    // (CMC notify_create_canister returns only the principal).
    cyclesSeeded : Cycles;
  };

  // Cost breakdown shown upfront to the user before committing.
  // Creation is fully user-funded via CMC notify_create_canister — the app
  // attaches zero of its own cycles so multi-user creation cannot drain it.
  public type CreationCostEstimate = {
    creationFeeIcpE8s : E8s; // Min ICP charged for CMC create (covers fee + residual cycles)
    transferFeeE8s : E8s; // ICP ledger fee per transfer (10_000 e8s)
    totalIcpRequiredE8s : E8s; // Gross ICP user must hold: creationFee + seed
    seedCyclesIcpE8s : E8s; // Passthrough of the user's requested extra seed ICP
    creationCycles : Cycles; // Protocol creation fee in cycles (500B)
    estimatedSeedCycles : Cycles; // Est. residual cycles on new canister after creation fee
    cyclesPerIcp : Nat; // Live ICP→cycles rate used for the estimate
  };
};

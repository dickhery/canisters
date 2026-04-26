import CommonTypes "common";

module {
  public type UserId = CommonTypes.UserId;
  public type CanisterId = CommonTypes.CanisterId;
  public type Timestamp = CommonTypes.Timestamp;

  // Status of a canister as reported by the IC management canister
  public type CanisterStatus = {
    #running;
    #stopped;
    #stopping;
  };

  // A tracked canister entry stored per user
  public type TrackedCanister = {
    canisterId : CanisterId;
    var customName : Text;
    addedAt : Timestamp;
  };

  // Public (shared) view of a tracked canister — no var fields
  public type CanisterInfo = {
    canisterId : CanisterId;
    customName : Text;
    addedAt : Timestamp;
  };

  // Full canister details including live IC data (returned from queries)
  public type CanisterDetails = {
    canisterId : CanisterId;
    customName : Text;
    cycleBalance : CommonTypes.Cycles;
    status : CanisterStatus;
    controllers : [Principal];
    createdAt : Timestamp;
    lastChecked : Timestamp;
  };

  // Summary row for the paginated canister list
  public type CanisterSummary = {
    canisterId : CanisterId;
    customName : Text;
    cycleBalance : CommonTypes.Cycles;
    status : CanisterStatus;
    lastChecked : Timestamp;
  };
};

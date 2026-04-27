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
    var lastInteractedAt : Timestamp; // updated on view/top-up/rename/controller changes
    var cachedCycleBalance : CommonTypes.Cycles; // last known balance; 0 if never fetched
    var cachedControllers : [Principal]; // last known controllers; [] if never fetched
  };

  // Public (shared) view of a tracked canister — no var fields
  public type CanisterInfo = {
    canisterId : CanisterId;
    customName : Text;
    addedAt : Timestamp;
    lastInteractedAt : Timestamp;
    cachedCycleBalance : CommonTypes.Cycles;
    isController : Bool; // true if the app's own principal is in cachedControllers
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
    fetchFailed : Bool;
  };

  // Summary row for the paginated canister list
  public type CanisterSummary = {
    canisterId : CanisterId;
    customName : Text;
    cycleBalance : CommonTypes.Cycles;
    status : CanisterStatus;
    lastChecked : Timestamp;
    fetchFailed : Bool;
    isController : Bool; // true if the app's own principal is in cachedControllers
  };

  // Dashboard item — used by getRecentCanisters and getLowestCyclesCanisters
  public type DashboardItem = {
    canisterId : CanisterId;
    customName : Text;
    cycleBalance : CommonTypes.Cycles;
    isController : Bool;
    lastInteractedAt : Timestamp;
  };
};

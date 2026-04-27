import List "mo:core/List";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Types "../types/canister";
import CommonTypes "../types/common";

module {
  // Initialize an empty canister registry for a new user
  public func initUserRegistry() : List.List<Types.TrackedCanister> {
    List.empty<Types.TrackedCanister>();
  };

  // Add a canister to the user's tracked list; returns #err if already tracked
  public func addCanister(
    canisters : List.List<Types.TrackedCanister>,
    canisterId : Types.CanisterId,
    customName : Text,
    now : Types.Timestamp,
  ) : CommonTypes.Result<()> {
    switch (canisters.find(func(c : Types.TrackedCanister) : Bool { Principal.equal(c.canisterId, canisterId) })) {
      case (?_) { #err("Canister already tracked") };
      case null {
        canisters.add({
          canisterId;
          var customName;
          addedAt = now;
          var lastInteractedAt = now;
          var cachedCycleBalance = 0;
          var cachedControllers = [] : [Principal];
        });
        #ok(());
      };
    };
  };

  // Remove a tracked canister by ID; returns #err if not found
  public func removeCanister(
    canisters : List.List<Types.TrackedCanister>,
    canisterId : Types.CanisterId,
  ) : CommonTypes.Result<()> {
    let sizeBefore = canisters.size();
    let filtered = canisters.filter(func(c : Types.TrackedCanister) : Bool {
      not Principal.equal(c.canisterId, canisterId)
    });
    if (filtered.size() == sizeBefore) {
      return #err("Canister not found");
    };
    canisters.clear();
    canisters.append(filtered);
    #ok(());
  };

  // Update the custom name of a tracked canister; returns #err if not found
  public func renameCanister(
    canisters : List.List<Types.TrackedCanister>,
    canisterId : Types.CanisterId,
    newName : Text,
    now : Types.Timestamp,
  ) : CommonTypes.Result<()> {
    switch (canisters.find(func(c : Types.TrackedCanister) : Bool { Principal.equal(c.canisterId, canisterId) })) {
      case null { #err("Canister not found") };
      case (?entry) {
        entry.customName := newName;
        entry.lastInteractedAt := now;
        #ok(());
      };
    };
  };

  // Touch the lastInteractedAt timestamp for a tracked canister
  public func touchInteraction(
    canisters : List.List<Types.TrackedCanister>,
    canisterId : Types.CanisterId,
    now : Types.Timestamp,
  ) {
    switch (canisters.find(func(c : Types.TrackedCanister) : Bool { Principal.equal(c.canisterId, canisterId) })) {
      case null {};
      case (?entry) { entry.lastInteractedAt := now };
    };
  };

  // Update the cached cycle balance for a tracked canister
  public func updateCachedBalance(
    canisters : List.List<Types.TrackedCanister>,
    canisterId : Types.CanisterId,
    balance : CommonTypes.Cycles,
  ) {
    switch (canisters.find(func(c : Types.TrackedCanister) : Bool { Principal.equal(c.canisterId, canisterId) })) {
      case null {};
      case (?entry) { entry.cachedCycleBalance := balance };
    };
  };

  // Update the cached controllers list for a tracked canister
  public func updateCachedControllers(
    canisters : List.List<Types.TrackedCanister>,
    canisterId : Types.CanisterId,
    controllers : [Principal],
  ) {
    switch (canisters.find(func(c : Types.TrackedCanister) : Bool { Principal.equal(c.canisterId, canisterId) })) {
      case null {};
      case (?entry) { entry.cachedControllers := controllers };
    };
  };

  // Return a paginated slice of tracked canisters (no live IC data)
  // appPrincipal is used to compute isController from cachedControllers
  public func listCanisters(
    canisters : List.List<Types.TrackedCanister>,
    page : Nat,
    pageSize : Nat,
    appPrincipal : Principal,
  ) : CommonTypes.Page<Types.CanisterInfo> {
    let total = canisters.size();
    let start = page * pageSize;
    let items : [Types.CanisterInfo] = if (start >= total) {
      [];
    } else {
      let end = if (start + pageSize > total) total else start + pageSize;
      let slice = canisters.sliceToArray(start, end);
      slice.map<Types.TrackedCanister, Types.CanisterInfo>(
        func(c : Types.TrackedCanister) : Types.CanisterInfo {
          let isController = c.cachedControllers.find(func(p : Principal) : Bool { Principal.equal(p, appPrincipal) }) != null;
          {
            canisterId = c.canisterId;
            customName = c.customName;
            addedAt = c.addedAt;
            lastInteractedAt = c.lastInteractedAt;
            cachedCycleBalance = c.cachedCycleBalance;
            isController;
          }
        },
      );
    };
    { items; total; page; pageSize };
  };

  // Look up a single tracked canister; returns null if not tracked
  public func getTracked(
    canisters : List.List<Types.TrackedCanister>,
    canisterId : Types.CanisterId,
  ) : ?Types.TrackedCanister {
    canisters.find(func(c : Types.TrackedCanister) : Bool { Principal.equal(c.canisterId, canisterId) });
  };

  // Search ALL tracked canisters (across all pages) by name or canister ID (case-insensitive substring match)
  // appPrincipal is used to compute isController from cachedControllers
  public func searchCanisters(
    canisters : List.List<Types.TrackedCanister>,
    queryText : Text,
    appPrincipal : Principal,
  ) : [Types.CanisterInfo] {
    let toInfo = func(c : Types.TrackedCanister) : Types.CanisterInfo {
      let isController = c.cachedControllers.find(func(p : Principal) : Bool { Principal.equal(p, appPrincipal) }) != null;
      {
        canisterId = c.canisterId;
        customName = c.customName;
        addedAt = c.addedAt;
        lastInteractedAt = c.lastInteractedAt;
        cachedCycleBalance = c.cachedCycleBalance;
        isController;
      }
    };
    if (queryText.size() == 0) {
      return canisters.toArray().map<Types.TrackedCanister, Types.CanisterInfo>(toInfo);
    };
    let lowerQuery = queryText.toLower();
    canisters.toArray()
      .filter(func(c : Types.TrackedCanister) : Bool {
        let lowerName = c.customName.toLower();
        let idText = c.canisterId.toText();
        lowerName.contains(#text lowerQuery) or idText.contains(#text lowerQuery)
      })
      .map<Types.TrackedCanister, Types.CanisterInfo>(toInfo);
  };

  // Return up to 5 canisters sorted by lastInteractedAt descending (most recent first)
  // appPrincipal is used to compute isController from cached controllers
  public func getRecentCanisters(
    canisters : List.List<Types.TrackedCanister>,
    appPrincipal : Principal,
  ) : [Types.DashboardItem] {
    let all = canisters.toArray();
    let sorted = all.sort(func(a : Types.TrackedCanister, b : Types.TrackedCanister) : Order.Order { Int.compare(b.lastInteractedAt, a.lastInteractedAt) });
    let top5 = sorted.sliceToArray(0, if (sorted.size() < 5) sorted.size() else 5);
    top5.map<Types.TrackedCanister, Types.DashboardItem>(func(c) {
      let isController = c.cachedControllers.find(func(p : Principal) : Bool { Principal.equal(p, appPrincipal) }) != null;
      {
        canisterId = c.canisterId;
        customName = c.customName;
        cycleBalance = c.cachedCycleBalance;
        isController;
        lastInteractedAt = c.lastInteractedAt;
      }
    });
  };

  // Return up to 5 canisters with the lowest cached cycle balance (ascending)
  // Only includes canisters where the app IS a controller
  public func getLowestCyclesCanisters(
    canisters : List.List<Types.TrackedCanister>,
    appPrincipal : Principal,
  ) : [Types.DashboardItem] {
    let all = canisters.toArray();
    // Filter to only canisters where the app is a controller
    let controlled = all.filter(func(c : Types.TrackedCanister) : Bool {
      c.cachedControllers.find(func(p : Principal) : Bool { Principal.equal(p, appPrincipal) }) != null
    });
    let sorted = controlled.sort(func(a : Types.TrackedCanister, b : Types.TrackedCanister) : Order.Order { Nat.compare(a.cachedCycleBalance, b.cachedCycleBalance) });
    let top5 = sorted.sliceToArray(0, if (sorted.size() < 5) sorted.size() else 5);
    top5.map<Types.TrackedCanister, Types.DashboardItem>(func(c) {
      {
        canisterId = c.canisterId;
        customName = c.customName;
        cycleBalance = c.cachedCycleBalance;
        isController = true;
        lastInteractedAt = c.lastInteractedAt;
      }
    });
  };
};

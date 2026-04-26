import List "mo:core/List";
import Principal "mo:core/Principal";
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
        canisters.add({ canisterId; var customName; addedAt = now });
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
  ) : CommonTypes.Result<()> {
    switch (canisters.find(func(c : Types.TrackedCanister) : Bool { Principal.equal(c.canisterId, canisterId) })) {
      case null { #err("Canister not found") };
      case (?entry) {
        entry.customName := newName;
        #ok(());
      };
    };
  };

  // Return a paginated slice of tracked canisters (no live IC data)
  public func listCanisters(
    canisters : List.List<Types.TrackedCanister>,
    page : Nat,
    pageSize : Nat,
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
          { canisterId = c.canisterId; customName = c.customName; addedAt = c.addedAt }
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
};

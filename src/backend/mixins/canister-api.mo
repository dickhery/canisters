import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import CanisterTypes "../types/canister";
import CommonTypes "../types/common";
import LedgerTypes "../types/ledger";
import CanisterLib "../lib/canister";

// Canister management API mixin
// State slices injected: userCanisters, userAccounts, txLog, nextTxId
mixin (
  userCanisters : Map.Map<CommonTypes.UserId, List.List<CanisterTypes.TrackedCanister>>,
  userAccounts : Map.Map<CommonTypes.UserId, LedgerTypes.UserAccount>,
  txLog : List.List<LedgerTypes.Transaction>,
  nextTxId : { var value : Nat },
) {

  // IC management canister interface (aaaaa-aa)
  let ic : actor {
    canister_status : ({ canister_id : Principal }) -> async {
      status : { #running; #stopped; #stopping };
      cycles : Nat;
      settings : {
        controllers : [Principal];
        freezing_threshold : Nat;
        memory_allocation : Nat;
        compute_allocation : Nat;
      };
      module_hash : ?Blob;
      idle_cycles_burned_per_day : Nat;
    };
    update_settings : ({
      canister_id : Principal;
      settings : {
        controllers : ?[Principal];
        freezing_threshold : ?Nat;
        memory_allocation : ?Nat;
        compute_allocation : ?Nat;
      };
    }) -> async ();
  } = actor "aaaaa-aa";

  // --- Private helpers ---

  // Get or create the caller's canister list
  private func getUserCanisters(userId : CommonTypes.UserId) : List.List<CanisterTypes.TrackedCanister> {
    switch (userCanisters.get(userId)) {
      case (?list) list;
      case null {
        let list = CanisterLib.initUserRegistry();
        userCanisters.add(userId, list);
        list;
      };
    };
  };

  // Fetch live status for a single canister; returns defaults on error
  private func fetchSummary(info : CanisterTypes.CanisterInfo, now : CommonTypes.Timestamp) : async CanisterTypes.CanisterSummary {
    try {
      let result = await ic.canister_status({ canister_id = info.canisterId });
      let status : CanisterTypes.CanisterStatus = switch (result.status) {
        case (#running) #running;
        case (#stopped) #stopped;
        case (#stopping) #stopping;
      };
      {
        canisterId = info.canisterId;
        customName = info.customName;
        cycleBalance = result.cycles;
        status;
        lastChecked = now;
      };
    } catch (_) {
      {
        canisterId = info.canisterId;
        customName = info.customName;
        cycleBalance = 0;
        status = #running;
        lastChecked = now;
      };
    };
  };

  // --- Canister tracking ---

  // Add a canister to the caller's tracked list
  public shared ({ caller }) func addCanister(
    canisterId : CanisterTypes.CanisterId,
    customName : Text,
  ) : async CommonTypes.Result<()> {
    if (caller.isAnonymous()) Runtime.trap("Anonymous caller not allowed");
    let canisters = getUserCanisters(caller);
    CanisterLib.addCanister(canisters, canisterId, customName, Time.now());
  };

  // Remove a canister from the caller's tracked list
  public shared ({ caller }) func removeCanister(
    canisterId : CanisterTypes.CanisterId,
  ) : async CommonTypes.Result<()> {
    if (caller.isAnonymous()) Runtime.trap("Anonymous caller not allowed");
    let canisters = getUserCanisters(caller);
    CanisterLib.removeCanister(canisters, canisterId);
  };

  // Update the custom name for a tracked canister
  public shared ({ caller }) func renameCanister(
    canisterId : CanisterTypes.CanisterId,
    newName : Text,
  ) : async CommonTypes.Result<()> {
    if (caller.isAnonymous()) Runtime.trap("Anonymous caller not allowed");
    let canisters = getUserCanisters(caller);
    CanisterLib.renameCanister(canisters, canisterId, newName);
  };

  // Get a paginated list of tracked canisters with live cycle/status data
  public shared ({ caller }) func listCanisters(
    page : Nat,
  ) : async CommonTypes.Page<CanisterTypes.CanisterSummary> {
    if (caller.isAnonymous()) Runtime.trap("Anonymous caller not allowed");
    let pageSize = 20;
    let canisters = getUserCanisters(caller);
    let infoPage = CanisterLib.listCanisters(canisters, page, pageSize);
    let now = Time.now();
    // Fetch live status sequentially for each canister in the page
    let summaries = List.empty<CanisterTypes.CanisterSummary>();
    for (info in infoPage.items.values()) {
      let summary = await fetchSummary(info, now);
      summaries.add(summary);
    };
    {
      items = summaries.toArray();
      total = infoPage.total;
      page = infoPage.page;
      pageSize = infoPage.pageSize;
    };
  };

  // Get full details for a single canister (live IC query)
  public shared ({ caller }) func getCanisterDetails(
    canisterId : CanisterTypes.CanisterId,
  ) : async ?CanisterTypes.CanisterDetails {
    if (caller.isAnonymous()) Runtime.trap("Anonymous caller not allowed");
    let canisters = getUserCanisters(caller);
    switch (CanisterLib.getTracked(canisters, canisterId)) {
      case null null;
      case (?tracked) {
        let now = Time.now();
        try {
          let result = await ic.canister_status({ canister_id = canisterId });
          let status : CanisterTypes.CanisterStatus = switch (result.status) {
            case (#running) #running;
            case (#stopped) #stopped;
            case (#stopping) #stopping;
          };
          ?{
            canisterId;
            customName = tracked.customName;
            cycleBalance = result.cycles;
            status;
            controllers = result.settings.controllers;
            createdAt = tracked.addedAt;
            lastChecked = now;
          };
        } catch (_) {
          ?{
            canisterId;
            customName = tracked.customName;
            cycleBalance = 0;
            status = #running;
            controllers = [];
            createdAt = tracked.addedAt;
            lastChecked = now;
          };
        };
      };
    };
  };

  // --- Controller management ---

  // Add a controller principal to a canister via IC management canister
  public shared ({ caller }) func addController(
    canisterId : CanisterTypes.CanisterId,
    controller : Principal,
  ) : async CommonTypes.Result<()> {
    if (caller.isAnonymous()) Runtime.trap("Anonymous caller not allowed");
    try {
      let status = await ic.canister_status({ canister_id = canisterId });
      let currentControllers = status.settings.controllers;
      let alreadyController = currentControllers.find(func(p : Principal) : Bool { Principal.equal(p, controller) });
      switch (alreadyController) {
        case (?_) { #err("Principal is already a controller") };
        case null {
          let updated = currentControllers.concat([controller]);
          await ic.update_settings({
            canister_id = canisterId;
            settings = {
              controllers = ?updated;
              freezing_threshold = null;
              memory_allocation = null;
              compute_allocation = null;
            };
          });
          #ok(());
        };
      };
    } catch (_) {
      #err("Failed to update controllers");
    };
  };

  // Remove a controller principal from a canister via IC management canister
  public shared ({ caller }) func removeController(
    canisterId : CanisterTypes.CanisterId,
    controller : Principal,
  ) : async CommonTypes.Result<()> {
    if (caller.isAnonymous()) Runtime.trap("Anonymous caller not allowed");
    try {
      let status = await ic.canister_status({ canister_id = canisterId });
      let currentControllers = status.settings.controllers;
      let updated = currentControllers.filter(func(p : Principal) : Bool { not Principal.equal(p, controller) });
      if (updated.size() == currentControllers.size()) {
        return #err("Principal is not a controller");
      };
      if (updated.size() == 0) {
        return #err("Cannot remove the last controller");
      };
      await ic.update_settings({
        canister_id = canisterId;
        settings = {
          controllers = ?updated;
          freezing_threshold = null;
          memory_allocation = null;
          compute_allocation = null;
        };
      });
      #ok(());
    } catch (_) {
      #err("Failed to update controllers");
    };
  };
};

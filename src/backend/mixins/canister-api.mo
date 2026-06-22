import Map "mo:core/Map";
import List "mo:core/List";
import Nat64 "mo:core/Nat64";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

import CanisterTypes "../types/canister";
import CommonTypes "../types/common";
import LedgerTypes "../types/ledger";
import CanisterLib "../lib/canister";
import Array "mo:core/Array";

// Canister management API mixin
// State slices injected: selfPrincipal, userCanisters, userAccounts, txLog, nextTxId
mixin (
  selfPrincipal : Principal,
  userCanisters : Map.Map<CommonTypes.UserId, List.List<CanisterTypes.TrackedCanister>>,
  userAccounts : Map.Map<CommonTypes.UserId, LedgerTypes.UserAccount>,
  txLog : List.List<LedgerTypes.Transaction>,
  nextTxId : { var value : Nat },
) {

  // IC management canister interface (aaaaa-aa) — status and settings methods
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

  // Fetch live status for a single canister; updates cached balance; returns defaults on error
  private func fetchSummary(
    canisters : List.List<CanisterTypes.TrackedCanister>,
    info : CanisterTypes.CanisterInfo,
    now : CommonTypes.Timestamp,
  ) : async CanisterTypes.CanisterSummary {
    try {
      let result = await ic.canister_status({ canister_id = info.canisterId });
      let status : CanisterTypes.CanisterStatus = switch (result.status) {
        case (#running) #running;
        case (#stopped) #stopped;
        case (#stopping) #stopping;
      };
      // Persist the fetched balance and controllers into TrackedCanister so dashboard queries have fresh data
      CanisterLib.updateCachedBalance(canisters, info.canisterId, result.cycles);
      CanisterLib.updateCachedControllers(canisters, info.canisterId, result.settings.controllers);
      let isController = result.settings.controllers.find(func(p : Principal) : Bool { Principal.equal(p, selfPrincipal) }) != null;
      {
        canisterId = info.canisterId;
        customName = info.customName;
        cycleBalance = result.cycles;
        status;
        lastChecked = now;
        fetchFailed = false;
        isController;
      };
    } catch (_) {
      // Return last cached balance rather than 0 to avoid false "empty" display
      // For isController, fall back to the isController field already computed in CanisterInfo
      let isController = info.isController;
      {
        canisterId = info.canisterId;
        customName = info.customName;
        cycleBalance = info.cachedCycleBalance;
        status = #running;
        lastChecked = now;
        fetchFailed = true;
        isController;
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

  // Update the custom name for a tracked canister (touches lastInteractedAt)
  public shared ({ caller }) func renameCanister(
    canisterId : CanisterTypes.CanisterId,
    newName : Text,
  ) : async CommonTypes.Result<()> {
    if (caller.isAnonymous()) Runtime.trap("Anonymous caller not allowed");
    let canisters = getUserCanisters(caller);
    CanisterLib.renameCanister(canisters, canisterId, newName, Time.now());
  };

  // Get a paginated list of tracked canisters using cached data (no live IC calls).
  // Live data is fetched lazily on the detail page via getCanisterDetails.
  // Returning cached data as a query avoids both cycle burn and update-call latency.
  public shared query ({ caller }) func listCanisters(
    page : Nat,
  ) : async CommonTypes.Page<CanisterTypes.CanisterSummary> {
    if (caller.isAnonymous()) Runtime.trap("Anonymous caller not allowed");
    let pageSize = 20;
    let now = Time.now();
    switch (userCanisters.get(caller)) {
      case null {
        { items = []; total = 0; page; pageSize };
      };
      case (?canisters) {
        let infoPage = CanisterLib.listCanisters(canisters, page, pageSize, selfPrincipal);
        let items = infoPage.items;
        // Build summaries from cached data — no IC calls, no await, no timeout risk.
        let summaries = items.map(
          func(info : CanisterTypes.CanisterInfo) : CanisterTypes.CanisterSummary {
            {
              canisterId = info.canisterId;
              customName = info.customName;
              cycleBalance = info.cachedCycleBalance;
              status = #running;
              lastChecked = now;
              fetchFailed = false;
              isController = info.isController;
            }
          }
        );
        {
          items = summaries;
          total = infoPage.total;
          page = infoPage.page;
          pageSize = infoPage.pageSize;
        };
      };
    };
  };

  // Get full details for a single canister (live IC query); touches lastInteractedAt
  public shared ({ caller }) func getCanisterDetails(
    canisterId : CanisterTypes.CanisterId,
  ) : async ?CanisterTypes.CanisterDetails {
    if (caller.isAnonymous()) Runtime.trap("Anonymous caller not allowed");
    let canisters = getUserCanisters(caller);
    switch (CanisterLib.getTracked(canisters, canisterId)) {
      case null null;
      case (?tracked) {
        let now = Time.now();
        // Mark as interacted (detail page view)
        CanisterLib.touchInteraction(canisters, canisterId, now);
        try {
          let result = await ic.canister_status({ canister_id = canisterId });
          let status : CanisterTypes.CanisterStatus = switch (result.status) {
            case (#running) #running;
            case (#stopped) #stopped;
            case (#stopping) #stopping;
          };
          // Update cached balance and controllers
          CanisterLib.updateCachedBalance(canisters, canisterId, result.cycles);
          CanisterLib.updateCachedControllers(canisters, canisterId, result.settings.controllers);
          ?{
            canisterId;
            customName = tracked.customName;
            cycleBalance = result.cycles;
            status;
            controllers = result.settings.controllers;
            createdAt = tracked.addedAt;
            lastChecked = now;
            fetchFailed = false;
          };
        } catch (_) {
          ?{
            canisterId;
            customName = tracked.customName;
            cycleBalance = tracked.cachedCycleBalance;
            status = #running;
            controllers = [];
            createdAt = tracked.addedAt;
            lastChecked = now;
            fetchFailed = true;
          };
        };
      };
    };
  };

  // --- Controller management ---

  // Add a controller principal to a canister via IC management canister; touches lastInteractedAt
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
          // Touch interaction after successful controller add
          let canisters = getUserCanisters(caller);
          CanisterLib.touchInteraction(canisters, canisterId, Time.now());
          #ok(());
        };
      };
    } catch (_) {
      #err("Failed to update controllers");
    };
  };

  // Remove a controller principal from a canister via IC management canister; touches lastInteractedAt
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
      // Touch interaction after successful controller removal
      let canisters = getUserCanisters(caller);
      CanisterLib.touchInteraction(canisters, canisterId, Time.now());
      #ok(());
    } catch (_) {
      #err("Failed to update controllers");
    };
  };

  // --- Dashboard queries ---

  // Search ALL tracked canisters by name or canister ID (case-insensitive); returns flat array of CanisterInfo
  public shared query ({ caller }) func searchCanisters(queryText : Text) : async [CanisterTypes.CanisterInfo] {
    if (caller.isAnonymous()) Runtime.trap("Anonymous caller not allowed");
    switch (userCanisters.get(caller)) {
      case null [];
      case (?canisters) CanisterLib.searchCanisters(canisters, queryText, selfPrincipal);
    };
  };

  // Return up to 5 most recently interacted canisters for the dashboard
  public shared query ({ caller }) func getRecentCanisters() : async [CanisterTypes.DashboardItem] {
    if (caller.isAnonymous()) Runtime.trap("Anonymous caller not allowed");
    let canisters = getUserCanisters(caller);
    CanisterLib.getRecentCanisters(canisters, selfPrincipal);
  };

  // Return up to 5 canisters with the lowest cached cycle balance for the dashboard
  public shared query ({ caller }) func getLowestCyclesCanisters() : async [CanisterTypes.DashboardItem] {
    if (caller.isAnonymous()) Runtime.trap("Anonymous caller not allowed");
    let canisters = getUserCanisters(caller);
    CanisterLib.getLowestCyclesCanisters(canisters, selfPrincipal);
  };

  // Return the total cached cycle balance across all tracked canisters.
  // Uses locally cached balances only — no management canister calls.
  // Balances refresh when a canister detail page is opened or after mutations.
  public shared query ({ caller }) func getTotalCycles() : async Nat {
    if (caller.isAnonymous()) Runtime.trap("Anonymous caller not allowed");
    switch (userCanisters.get(caller)) {
      case null { 0 };
      case (?canisters) { CanisterLib.sumCachedCycles(canisters) };
    };
  };

  // --- Principal migration / data recovery ---

  // Migrate tracked canisters from an old principal to the caller's current principal.
  // Useful when a user's principal changed due to a derivationOrigin/domain change.
  // Returns the number of canisters migrated, or an error if the old principal has no data.
  // Canisters already tracked by the caller are skipped (no duplicates).
  public shared ({ caller }) func migrateCanistersFromPrincipal(
    oldPrincipal : Principal,
  ) : async CommonTypes.Result<Nat> {
    if (caller.isAnonymous()) return #err("Anonymous caller not allowed");
    if (Principal.equal(caller, oldPrincipal)) return #err("Old principal must differ from current principal");

    // Look up canisters under the old principal
    let oldList = switch (userCanisters.get(oldPrincipal)) {
      case null return #err("No data found for the provided principal ID");
      case (?list) list;
    };

    if (oldList.size() == 0) return #err("No canisters found under the provided principal ID");

    let callerList = getUserCanisters(caller);
    var migrated = 0;

    for (tracked in oldList.values()) {
      // Skip canisters already tracked by caller
      let alreadyTracked = switch (callerList.find(
        func(c : CanisterTypes.TrackedCanister) : Bool {
          Principal.equal(c.canisterId, tracked.canisterId)
        }
      )) {
        case (?_) true;
        case null false;
      };
      if (not alreadyTracked) {
        callerList.add({
          canisterId = tracked.canisterId;
          var customName = tracked.customName;
          addedAt = tracked.addedAt;
          var lastInteractedAt = tracked.lastInteractedAt;
          var cachedCycleBalance = tracked.cachedCycleBalance;
          var cachedControllers = tracked.cachedControllers;
        });
        migrated += 1;
      };
    };

    #ok(migrated);
  };

  // --- Cycles transfer ---

  // Transfer cycles FROM a source canister (fromCanisterId) TO a destination canister.
  //
  // Cycles can only leave a canister when THAT canister itself makes an outbound call with
  // cycles attached. The app canister cannot "pull" cycles out of another canister.
  //
  // Strategy (tried in order):
  //   1. Inter-canister call: invoke `withdrawCyclesTo` on fromCanisterId — this works for any
  //      canister running this same app code (i.e. canisters created via "Create Canister" in-app).
  //      The source canister executes `deposit_cycles`, so cycles leave from its own balance.
  //   2. wallet_send fallback: try the standard ICP wallet interface for wallet-type canisters.
  //   3. If both fail: return a clear error.
  //
  // Validates:
  //   1. Caller is not anonymous.
  //   2. amount > 0.
  //   3. fromCanisterId is in the caller's tracked canisters list.
  //   4. The app principal (selfPrincipal) is in that canister's cachedControllers (◆CTRL).
  //   5. Source canister has sufficient cached cycles balance.
  public shared ({ caller }) func transferCycles(
    fromCanisterId : Principal,
    toCanisterId : Principal,
    amount : Nat,
  ) : async CommonTypes.Result<Nat> {
    if (caller.isAnonymous()) return #err("Anonymous caller not allowed");
    if (amount == 0) return #err("Transfer amount must be greater than 0");

    let canisters = getUserCanisters(caller);

    // Validate fromCanisterId is tracked by the caller
    switch (CanisterLib.getTracked(canisters, fromCanisterId)) {
      case null return #err("Canister not found in your tracked list");
      case (?tracked) {
        // Validate the app is a controller of fromCanisterId
        let appIsController = tracked.cachedControllers.find(
          func(p : Principal) : Bool { Principal.equal(p, selfPrincipal) }
        ) != null;
        if (not appIsController) {
          return #err("The app is not a confirmed controller of this canister (◆CTRL required)");
        };

        // Validate sufficient cached balance
        if (tracked.cachedCycleBalance < amount) {
          return #err("Insufficient cycles balance on source canister");
        };

        // Helper: update cached state after a successful transfer
        let commitSuccess = func() : Nat {
          let newBalance : Nat = if (tracked.cachedCycleBalance > amount) {
            tracked.cachedCycleBalance - amount
          } else { 0 };
          CanisterLib.updateCachedBalance(canisters, fromCanisterId, newBalance);
          CanisterLib.touchInteraction(canisters, fromCanisterId, Time.now());
          newBalance;
        };

        // --- Attempt 1: inter-canister call to withdrawCyclesTo on the source canister ---
        // This works when the source canister is running this same app code (in-app created).
        // The source canister is the one calling deposit_cycles, so cycles leave from its balance.
        let sourceCanister : actor {
          withdrawCyclesTo : (Principal, Nat) -> async ();
        } = actor (fromCanisterId.toText());

        try {
          await sourceCanister.withdrawCyclesTo(toCanisterId, amount);
          #ok(commitSuccess());
        } catch (_) {
          // --- Attempt 2: wallet_send fallback for ICP cycle wallet canisters ---
          let walletCanister : actor {
            wallet_send : ({
              canister : Principal;
              amount : Nat64;
            }) -> async { #Ok; #Err : Text };
          } = actor (fromCanisterId.toText());

          try {
            let walletResult = await walletCanister.wallet_send({
              canister = toCanisterId;
              amount = Nat64.fromNat(amount);
            });
            switch (walletResult) {
              case (#Ok) { #ok(commitSuccess()) };
              case (#Err(msg)) { #err("Wallet transfer failed: " # msg) };
            };
          } catch (_) {
            #err("Cycles transfer failed. The source canister does not support cycle withdrawal. Only canisters created within this app or ICP cycle wallets can transfer cycles out.");
          };
        };
      };
    };
  };
};

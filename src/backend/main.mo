import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import CommonTypes "types/common";
import CanisterTypes "types/canister";
import LedgerTypes "types/ledger";
import CanisterApi "mixins/canister-api";
import LedgerApi "mixins/ledger-api";
import CanisterCreationApi "mixins/canister-creation-api";




actor self {
  // --- Shared state ---

  // Per-user list of tracked canisters: UserId → [TrackedCanister]
  let userCanisters = Map.empty<CommonTypes.UserId, List.List<CanisterTypes.TrackedCanister>>();

  // Per-user ICP sub-account info: UserId → UserAccount
  let userAccounts = Map.empty<CommonTypes.UserId, LedgerTypes.UserAccount>();

  // Append-only transaction log (all users)
  let txLog = List.empty<LedgerTypes.Transaction>();

  // Monotonically increasing transaction ID counter
  let nextTxId = { var value : Nat = 0 };

  // The canister's own principal — used to derive per-user ICP sub-account IDs
  let selfPrincipal = Principal.fromActor(self);

  // --- Mixin composition ---
  include CanisterApi(selfPrincipal, userCanisters, userAccounts, txLog, nextTxId);
  include LedgerApi(selfPrincipal, userAccounts, txLog, nextTxId, userCanisters);
  include CanisterCreationApi(selfPrincipal, userCanisters, userAccounts, txLog, nextTxId);

  // Expose the app's own principal so the frontend can display it as the
  // "App Controller PID" and allow users to add it as a controller.
  public shared query func getAppPrincipal() : async Principal {
    selfPrincipal;
  };

  // Called inter-canister by the app on a SOURCE canister (which runs this same code).
  // Sends `amount` cycles FROM this canister (the source) to `destination` via deposit_cycles.
  // Only the app itself (selfPrincipal) may call this, preventing arbitrary cycle drains.
  public shared ({ caller }) func withdrawCyclesTo(destination : Principal, amount : Nat) : async () {
    if (not Principal.equal(caller, selfPrincipal)) {
      Runtime.trap("Unauthorized: only the app canister may call withdrawCyclesTo");
    };
    let icDeposit : actor {
      deposit_cycles : ({ canister_id : Principal }) -> async ();
    } = actor "aaaaa-aa";
    await (with cycles = amount) icDeposit.deposit_cycles({ canister_id = destination });
  };
};

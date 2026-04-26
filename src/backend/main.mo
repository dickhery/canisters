import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import CommonTypes "types/common";
import CanisterTypes "types/canister";
import LedgerTypes "types/ledger";
import CanisterApi "mixins/canister-api";
import LedgerApi "mixins/ledger-api";

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
  include CanisterApi(userCanisters, userAccounts, txLog, nextTxId);
  include LedgerApi(selfPrincipal, userAccounts, txLog, nextTxId);

  // Expose the app's own principal so the frontend can display it as the
  // "App Controller PID" and allow users to add it as a controller.
  public shared query func getAppPrincipal() : async Principal {
    selfPrincipal;
  };
};

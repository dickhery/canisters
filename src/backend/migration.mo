import Nat64 "mo:core/Nat64";

// One-shot upgrade migration: drop obsolete stable actor stubs from the
// pre-CMC-create version of the canister.
//
// The deployed canister still has stable fields:
//   - icMgmt  (management create_canister handle — no longer used)
//   - cmcActor (old interface with notify_top_up only)
//
// Both are recreated as `transient` lets on each upgrade (remote principals,
// not real state). Migration consumes them so Motoko does not require the
// new stable signature to keep or reshape those fields (M0169 / M0170).
module {
  type OldCmcActor = actor {
    get_icp_xdr_conversion_rate : () -> async {
      data : { xdr_permyriad_per_icp : Nat64; timestamp_seconds : Nat64 };
      certificate : Blob;
    };
    notify_top_up : { block_index : Nat64; canister_id : Principal } -> async {
      #Ok : Nat;
      #Err : {
        #Refunded : { block_index : ?Nat64; reason : Text };
        #InvalidTransaction : Text;
        #Other : { error_code : Nat64; error_message : Text };
        #Processing;
        #TransactionTooOld : Nat64;
      };
    };
  };

  type OldIcMgmt = actor {
    create_canister : ({
      settings : ?{
        controllers : ?[Principal];
        freezing_threshold : ?Nat;
        memory_allocation : ?Nat;
        compute_allocation : ?Nat;
      };
    }) -> async { canister_id : Principal };
  };

  // Only list fields we intentionally discard. All other actor fields
  // (userCanisters, userAccounts, txLog, caches, …) carry through.
  public type Old = {
    icMgmt : OldIcMgmt;
    cmcActor : OldCmcActor;
  };

  public type New = {};

  public func run(_old : Old) : New {
    {}
  };
};

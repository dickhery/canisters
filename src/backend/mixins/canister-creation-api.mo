import Map "mo:core/Map";
import List "mo:core/List";
import Nat64 "mo:core/Nat64";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import CommonTypes "../types/common";
import CanisterTypes "../types/canister";
import LedgerTypes "../types/ledger";
import CreationTypes "../types/canister-creation";
import CreationLib "../lib/canister-creation";
import CanisterLib "../lib/canister";
import LedgerLib "../lib/ledger";

// Canister-creation API mixin.
// Orchestrates: IC management create_canister → optional CMC seed top-up → auto-track.
// State slices mirror those in CanisterApi and LedgerApi.
mixin (
  selfPrincipal : Principal,
  userCanisters : Map.Map<CommonTypes.UserId, List.List<CanisterTypes.TrackedCanister>>,
  userAccounts : Map.Map<CommonTypes.UserId, LedgerTypes.UserAccount>,
  txLog : List.List<LedgerTypes.Transaction>,
  nextTxId : { var value : Nat },
) {

  let CREATION_ICP_LEDGER_ID = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
  let CREATION_CMC_ID        = Principal.fromText("rkp4c-7iaaa-aaaaa-aaaca-cai");

  // IC management canister — used for canister creation
  let icMgmt : actor {
    create_canister : ({
      settings : ?{
        controllers : ?[Principal];
        freezing_threshold : ?Nat;
        memory_allocation : ?Nat;
        compute_allocation : ?Nat;
      };
    }) -> async { canister_id : Principal };
  } = actor "aaaaa-aa";

  // CMC actor type — used for rate queries and top-up notifications
  let cmcActor : actor {
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
  } = actor "rkp4c-7iaaa-aaaaa-aaaca-cai";

  // Fetch the live ICP→cycles conversion rate from the CMC.
  // Returns cycles per 1 ICP (e.g. ~10_000_000_000_000 for ~10 XDR/ICP).
  // Falls back to DEFAULT_CYCLES_PER_ICP if the CMC call fails.
  public shared func getIcpXdrConversionRate() : async Nat {
    try {
      let response = await cmcActor.get_icp_xdr_conversion_rate();
      CreationLib.xdrPermyriadToCyclesPerIcp(response.data.xdr_permyriad_per_icp)
    } catch (_) {
      CreationLib.DEFAULT_CYCLES_PER_ICP
    }
  };

  // Return an upfront cost estimate for canister creation + optional seed top-up,
  // using the live CMC ICP/XDR conversion rate for accurate cycles estimates.
  public shared func getCreationCostEstimate(
    seedCyclesIcpE8s : CommonTypes.E8s,
  ) : async CreationTypes.CreationCostEstimate {
    let cyclesPerIcp = try {
      let response = await cmcActor.get_icp_xdr_conversion_rate();
      CreationLib.xdrPermyriadToCyclesPerIcp(response.data.xdr_permyriad_per_icp)
    } catch (_) {
      CreationLib.DEFAULT_CYCLES_PER_ICP
    };
    CreationLib.estimateCreationCost(seedCyclesIcpE8s, cyclesPerIcp)
  };

  // Create a new canister, optionally seed it with cycles, and auto-track it
  // under the caller's account with the provided name.
  //
  // Steps:
  //   1. Validate inputs.
  //   2. Check caller has enough ICP in their sub-account.
  //   3. Transfer creation fee ICP from caller sub-account → CMC for this canister's principal
  //      (we will know the canister ID only after step 4, so we first create the canister,
  //       then notify CMC — this is the correct IC pattern).
  //      Actually: on IC the creation fee is paid in cycles from the calling canister.
  //      The management canister deducts CREATION_FEE_CYCLES from the app's balance.
  //      The user pays ICP only for the seed top-up.
  //   4. Call IC management canister create_canister — sets controllers to [caller, selfPrincipal].
  //   5. If seedCyclesIcpE8s > 0: transfer ICP from caller's sub-account → CMC subaccount for
  //      the new canister, then notify_top_up.
  //   6. Auto-track the new canister under the caller's account.
  //   7. Record a #topUp transaction if seeding occurred.
  //   8. Return CreateCanisterResult.
  //
  public shared ({ caller }) func createCanister(
    name : Text,
    seedCyclesIcpE8s : CommonTypes.E8s,
  ) : async CommonTypes.Result<CreationTypes.CreateCanisterResult> {
    if (caller.isAnonymous()) {
      return #err("Anonymous caller not allowed")
    };
    if (name.size() == 0) {
      return #err("Canister name cannot be empty")
    };

    // If user wants to seed cycles, verify they have enough ICP
    if (seedCyclesIcpE8s > 0) {
      if (seedCyclesIcpE8s <= CreationLib.ICP_FEE_E8S) {
        return #err("Seed amount must be greater than the transfer fee (10,000 e8s)")
      };
      // Check balance
      let callerSubaccountBlob = LedgerLib.principalToSubaccount(caller);
      let accountBlob = selfPrincipal.toLedgerAccount(?callerSubaccountBlob);
      let ledger = actor (CREATION_ICP_LEDGER_ID.toText()) : actor {
        account_balance : query { account : Blob } -> async { e8s : Nat64 };
      };
      let balResult = await ledger.account_balance({ account = accountBlob });
      let balance = balResult.e8s;
      if (balance < seedCyclesIcpE8s + CreationLib.ICP_FEE_E8S) {
        return #err(
          "Insufficient ICP balance for seed top-up. " #
          "Required: " # (seedCyclesIcpE8s + CreationLib.ICP_FEE_E8S).toText() #
          " e8s, Available: " # balance.toText() # " e8s"
        )
      };
    };

    // Step 1: Create the canister via IC management canister.
    // The 500B cycle creation fee is deducted from the app's own cycle balance.
    // Attach exactly CREATION_FEE_CYCLES to the call so the management canister
    // can deduct them; without this the call fails with "not enough cycles".
    let newCanisterId : Principal = try {
      let result = await (with cycles = CreationLib.CREATION_FEE_CYCLES) icMgmt.create_canister({
        settings = ?{
          controllers = ?[caller, selfPrincipal];
          freezing_threshold = null;
          memory_allocation = null;
          compute_allocation = null;
        };
      });
      result.canister_id
    } catch (err) {
      return #err("Failed to create canister: " # Error.message(err))
    };

    // Step 2: Optionally seed the new canister with cycles via CMC top-up
    let cyclesSeeded : Nat = if (seedCyclesIcpE8s > 0) {
      try {
        let callerSubaccount = LedgerLib.principalToSubaccount(caller);
        // CMC top-up destination: CMC's account for the target canister
        let cmcSubaccount = LedgerLib.principalToSubaccount(newCanisterId);
        let cmcAccountBlob = CREATION_CMC_ID.toLedgerAccount(?cmcSubaccount);

        let ledger = actor (CREATION_ICP_LEDGER_ID.toText()) : actor {
          transfer : {
            memo : Nat64;
            amount : { e8s : Nat64 };
            fee : { e8s : Nat64 };
            from_subaccount : ?Blob;
            to : Blob;
            created_at_time : ?{ timestamp_nanos : Nat64 };
          } -> async {
            #Ok : Nat64;
            #Err : {
              #BadFee : { expected_fee : { e8s : Nat64 } };
              #InsufficientFunds : { balance : { e8s : Nat64 } };
              #TxTooOld : { allowed_window_nanos : Nat64 };
              #TxCreatedInFuture;
              #TxDuplicate : { duplicate_of : Nat64 };
            };
          };
        };
        let transferResult = await ledger.transfer({
          memo = 0x50555054; // "PUPT" — recognized by CMC as a top-up
          amount = { e8s = seedCyclesIcpE8s - CreationLib.ICP_FEE_E8S };
          fee = { e8s = CreationLib.ICP_FEE_E8S };
          from_subaccount = ?callerSubaccount;
          to = cmcAccountBlob;
          created_at_time = null;
        });

        switch (transferResult) {
          case (#Err(_)) {
            // Canister was created but seed failed — still track with 0 cycles
            0
          };
          case (#Ok(blockIndex)) {
            let notifyResult = await cmcActor.notify_top_up({
              block_index = blockIndex;
              canister_id = newCanisterId;
            });
            switch (notifyResult) {
              case (#Ok(cycles)) {
                // Record the seed top-up transaction
                ignore LedgerLib.recordTransaction(
                  txLog,
                  nextTxId.value,
                  caller,
                  #topUp { canisterId = newCanisterId; cyclesAdded = cycles },
                  seedCyclesIcpE8s,
                  "Seed canister " # newCanisterId.toText(),
                  Time.now(),
                );
                nextTxId.value += 1;
                cycles
              };
              case (#Err(_)) { 0 };
            }
          };
        }
      } catch (_) { 0 }
    } else { 0 };

    // Step 3: Auto-track the new canister under the caller's account
    let canisters = switch (userCanisters.get(caller)) {
      case (?list) list;
      case null {
        let list = CanisterLib.initUserRegistry();
        userCanisters.add(caller, list);
        list
      };
    };
    ignore CanisterLib.addCanister(canisters, newCanisterId, name, Time.now());
    // Seed the known controllers immediately so dashboard queries are accurate from the start
    CanisterLib.updateCachedControllers(canisters, newCanisterId, [caller, selfPrincipal]);

    #ok({ canisterId = newCanisterId; cyclesSeeded })
  };
};

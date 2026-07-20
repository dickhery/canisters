import Map "mo:core/Map";
import List "mo:core/List";
import Nat64 "mo:core/Nat64";
import Principal "mo:core/Principal";
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
// Orchestrates: user ICP → CMC notify_create_canister → auto-track.
// The app never attaches its own cycles for creation (cycle-drain safe).
// State slices mirror those in CanisterApi and LedgerApi.
mixin (
  selfPrincipal : Principal,
  userCanisters : Map.Map<CommonTypes.UserId, List.List<CanisterTypes.TrackedCanister>>,
  userAccounts : Map.Map<CommonTypes.UserId, LedgerTypes.UserAccount>,
  txLog : List.List<LedgerTypes.Transaction>,
  nextTxId : { var value : Nat },
) {

  let CREATION_ICP_LEDGER_ID = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
  let CREATION_CMC_ID = Principal.fromText("rkp4c-7iaaa-aaaaa-aaaca-cai");

  // CMC actor — rate queries and create-from-ICP (notify_create_canister).
  // Settings type is intentionally minimal; unused optional fields are omitted
  // so Candid encoding stays compatible with the CMC service.
  let cmcActor : actor {
    get_icp_xdr_conversion_rate : () -> async {
      data : { xdr_permyriad_per_icp : Nat64; timestamp_seconds : Nat64 };
      certificate : Blob;
    };
    notify_create_canister : {
      block_index : Nat64;
      controller : Principal;
      subnet_type : ?Text;
      subnet_selection : ?{
        #Subnet : { subnet : Principal };
        #Filter : { subnet_type : ?Text };
      };
      settings : ?{
        controllers : ?[Principal];
        compute_allocation : ?Nat;
        memory_allocation : ?Nat;
        freezing_threshold : ?Nat;
      };
    } -> async {
      #Ok : Principal;
      #Err : {
        #Refunded : { block_index : ?Nat64; reason : Text };
        #InvalidTransaction : Text;
        #Other : { error_code : Nat64; error_message : Text };
        #Processing;
        #TransactionTooOld : Nat64;
      };
    };
  } = actor "rkp4c-7iaaa-aaaaa-aaaca-cai";

  // Cached CMC rate — avoids repeated inter-canister calls for the same data.
  var cachedCyclesPerIcp : Nat = CreationLib.DEFAULT_CYCLES_PER_ICP;
  var cachedRateFetchedAt : Int = 0;
  let RATE_CACHE_TTL_NS : Int = 3_600_000_000_000; // 1 hour

  // Per-caller reentrancy guard for createCanister (financial multi-await flow).
  let createInFlight = Map.empty<Principal, Bool>();

  func fetchCyclesPerIcp() : async Nat {
    let now = Time.now();
    if (cachedRateFetchedAt > 0 and (now - cachedRateFetchedAt) < RATE_CACHE_TTL_NS) {
      return cachedCyclesPerIcp;
    };
    try {
      let response = await cmcActor.get_icp_xdr_conversion_rate();
      let rate = CreationLib.xdrPermyriadToCyclesPerIcp(response.data.xdr_permyriad_per_icp);
      cachedCyclesPerIcp := rate;
      cachedRateFetchedAt := now;
      rate
    } catch (_) {
      CreationLib.DEFAULT_CYCLES_PER_ICP
    }
  };

  func notifyErrorText(e : {
    #Refunded : { block_index : ?Nat64; reason : Text };
    #InvalidTransaction : Text;
    #Other : { error_code : Nat64; error_message : Text };
    #Processing;
    #TransactionTooOld : Nat64;
  }) : Text {
    switch (e) {
      case (#Refunded { reason; block_index = _ }) { "Refunded: " # reason };
      case (#InvalidTransaction(t)) { "Invalid transaction: " # t };
      case (#Processing) { "Processing, try again" };
      case (#TransactionTooOld(_)) { "Transaction too old for CMC" };
      case (#Other { error_message; error_code = _ }) { error_message };
    }
  };

  // Fetch the live ICP→cycles conversion rate from the CMC (cached 1 hour).
  public shared func getIcpXdrConversionRate() : async Nat {
    await fetchCyclesPerIcp()
  };

  // Return an upfront cost estimate for canister creation + optional seed ICP.
  public shared func getCreationCostEstimate(
    seedCyclesIcpE8s : CommonTypes.E8s,
  ) : async CreationTypes.CreationCostEstimate {
    let cyclesPerIcp = await fetchCyclesPerIcp();
    CreationLib.estimateCreationCost(seedCyclesIcpE8s, cyclesPerIcp)
  };

  // Create a new canister funded entirely by the caller's ICP via the CMC.
  //
  // Steps:
  //   1. Validate inputs and acquire per-caller lock.
  //   2. Fetch live rate and compute min creation ICP + total gross.
  //   3. Verify caller's sub-account balance.
  //   4. Transfer gross - fee ICP from caller sub-account → CMC default account.
  //   5. CMC notify_create_canister (controllers = [caller, app]).
  //   6. Auto-track and record a #topUp transaction for the residual cycles estimate.
  //
  // The app attaches ZERO cycles — creation cannot drain the app's balance.
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

    // Reject concurrent createCanister calls from the same principal
    switch (createInFlight.get(caller)) {
      case (?_) {
        return #err("A canister creation is already in progress for this account")
      };
      case null {
        createInFlight.add(caller, true);
      };
    };

    // Entire create path runs under try/finally so the lock is always released
    // (including when a callback traps — finally runs in cleanup context).
    try {
      let cyclesPerIcp = await fetchCyclesPerIcp();
      let creationFeeIcpE8s = CreationLib.minCreationIcpE8s(cyclesPerIcp);
      let totalIcpE8s : Nat64 = creationFeeIcpE8s + seedCyclesIcpE8s;

      if (totalIcpE8s <= CreationLib.ICP_FEE_E8S) {
        return #err(
          "Creation amount too low. Minimum is about " #
          creationFeeIcpE8s.toText() # " e8s ICP at the current rate."
        )
      };

      // Check balance (gross amount, same pattern as topUpCanister)
      let callerSubaccountBlob = LedgerLib.principalToSubaccount(caller);
      let accountBlob = selfPrincipal.toLedgerAccount(?callerSubaccountBlob);
      let ledger = actor (CREATION_ICP_LEDGER_ID.toText()) : actor {
        account_balance : query { account : Blob } -> async { e8s : Nat64 };
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

      let balResult = await ledger.account_balance({ account = accountBlob });
      let balance = balResult.e8s;
      if (balance < totalIcpE8s) {
        return #err(
          "Insufficient ICP balance for canister creation. " #
          "Required: " # totalIcpE8s.toText() #
          " e8s, Available: " # balance.toText() # " e8s"
        )
      };

      // Transfer ICP to CMC default account (required for notify_create_canister).
      // Top-ups use a per-canister subaccount; create uses the CMC principal account.
      let cmcAccountBlob = CREATION_CMC_ID.toLedgerAccount(null);
      let transferAmount = totalIcpE8s - CreationLib.ICP_FEE_E8S;

      let transferResult = await ledger.transfer({
        memo = 0x43524541; // "CREA" — create payment marker
        amount = { e8s = transferAmount };
        fee = { e8s = CreationLib.ICP_FEE_E8S };
        from_subaccount = ?callerSubaccountBlob;
        to = cmcAccountBlob;
        created_at_time = null;
      });

      let blockIndex : Nat64 = switch (transferResult) {
        case (#Err(e)) {
          let msg = switch (e) {
            case (#InsufficientFunds { balance = b }) {
              "Insufficient funds. Balance: " # b.e8s.toText() # " e8s"
            };
            case (#BadFee { expected_fee }) {
              "Bad fee. Expected: " # expected_fee.e8s.toText() # " e8s"
            };
            case (#TxDuplicate { duplicate_of }) {
              "Duplicate transaction of block " # duplicate_of.toText()
            };
            case (#TxTooOld _) { "Transaction too old" };
            case (#TxCreatedInFuture) { "Transaction created in the future" };
          };
          return #err(msg)
        };
        case (#Ok(idx)) { idx };
      };

      // CMC converts ICP → cycles, pays creation fee, creates canister.
      let notifyResult = await cmcActor.notify_create_canister({
        block_index = blockIndex;
        controller = caller;
        subnet_type = null;
        subnet_selection = null;
        settings = ?{
          controllers = ?[caller, selfPrincipal];
          compute_allocation = null;
          memory_allocation = null;
          freezing_threshold = null;
        };
      });

      let newCanisterId : Principal = switch (notifyResult) {
        case (#Err(e)) {
          return #err("Failed to create canister: " # notifyErrorText(e))
        };
        case (#Ok(id)) { id };
      };

      // Estimate residual cycles on the new canister (CMC returns principal only).
      let netE8s = transferAmount.toNat();
      let minted = netE8s * cyclesPerIcp / 100_000_000;
      let cyclesSeeded : Nat = if (minted > CreationLib.CREATION_FEE_CYCLES) {
        minted - CreationLib.CREATION_FEE_CYCLES
      } else {
        0
      };

      // Auto-track under the caller's account
      let canisters = switch (userCanisters.get(caller)) {
        case (?list) list;
        case null {
          let list = CanisterLib.initUserRegistry();
          userCanisters.add(caller, list);
          list
        };
      };
      ignore CanisterLib.addCanister(canisters, newCanisterId, name, Time.now());
      CanisterLib.updateCachedControllers(canisters, newCanisterId, [caller, selfPrincipal]);
      if (cyclesSeeded > 0) {
        CanisterLib.updateCachedBalance(canisters, newCanisterId, cyclesSeeded);
      };

      ignore LedgerLib.recordTransaction(
        txLog,
        nextTxId.value,
        caller,
        #topUp { canisterId = newCanisterId; cyclesAdded = cyclesSeeded },
        totalIcpE8s,
        "Create canister " # newCanisterId.toText(),
        Time.now(),
      );
      nextTxId.value += 1;

      #ok({ canisterId = newCanisterId; cyclesSeeded })
    } catch (err) {
      #err("Failed to create canister: " # err.message())
    } finally {
      ignore createInFlight.delete(caller);
    }
  };
};

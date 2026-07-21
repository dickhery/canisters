import Map "mo:core/Map";
import List "mo:core/List";
import Blob "mo:core/Blob";
import Nat64 "mo:core/Nat64";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import CommonTypes "../types/common";
import CanisterTypes "../types/canister";
import LedgerTypes "../types/ledger";
import CreationTypes "../types/canister-creation";
import CreationLib "../lib/canister-creation";
import CanisterLib "../lib/canister";
import LedgerLib "../lib/ledger";

// Canister-creation API mixin.
// Orchestrates: user ICP → CMC notify_create_canister → auto-track.
// On notify failure after a successful transfer, records the ledger block so
// the user can retry without re-paying. Historical payments can be claimed
// after ICP ledger verification (from caller's sub-account + CREA memo).
// The app never attaches its own cycles for creation (cycle-drain safe).
mixin (
  selfPrincipal : Principal,
  userCanisters : Map.Map<CommonTypes.UserId, List.List<CanisterTypes.TrackedCanister>>,
  userAccounts : Map.Map<CommonTypes.UserId, LedgerTypes.UserAccount>,
  txLog : List.List<LedgerTypes.Transaction>,
  nextTxId : { var value : Nat },
  // blockIndex → failed/pending create payment owned by a user
  failedCreations : Map.Map<CreationTypes.BlockIndex, CreationTypes.FailedCreation>,
) {

  let CREATION_ICP_LEDGER_ID = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
  let CREATION_CMC_ID = Principal.fromText("rkp4c-7iaaa-aaaaa-aaaca-cai");

  // CMC actor — rate queries and create-from-ICP (notify_create_canister).
  // `transient`: remote actor handles are not real state.
  transient let cmcActor : actor {
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

  // Classic ICP ledger (for transfer + block ownership checks)
  type LedgerOp = {
    #Mint : { to : Blob; amount : { e8s : Nat64 } };
    #Burn : { from : Blob; amount : { e8s : Nat64 } };
    #Transfer : {
      from : Blob;
      to : Blob;
      amount : { e8s : Nat64 };
      fee : { e8s : Nat64 };
    };
    #Approve : {
      from : Blob;
      spender : Blob;
      allowance : { e8s : Nat64 };
      expected_allowance : ?{ e8s : Nat64 };
      expires_at : ?{ timestamp_nanos : Nat64 };
      fee : { e8s : Nat64 };
    };
    #TransferFrom : {
      from : Blob;
      to : Blob;
      spender : Blob;
      amount : { e8s : Nat64 };
      fee : { e8s : Nat64 };
    };
  };

  type LedgerTx = {
    memo : Nat64;
    icrc1_memo : ?Blob;
    operation : ?LedgerOp;
    created_at_time : ?{ timestamp_nanos : Nat64 };
  };

  type LedgerBlock = {
    parent_hash : ?Blob;
    transaction : LedgerTx;
    timestamp : { timestamp_nanos : Nat64 };
  };

  type GetBlocksArgs = { start : Nat64; length : Nat64 };

  type BlockRange = { blocks : [LedgerBlock] };

  type GetBlocksError = {
    #BadFirstBlockIndex : { requested_index : Nat64; first_valid_index : Nat64 };
    #Other : { error_message : Text; error_code : Nat64 };
  };

  type ArchivedRange = {
    start : Nat64;
    length : Nat64;
    callback : shared query GetBlocksArgs -> async {
      #Ok : BlockRange;
      #Err : GetBlocksError;
    };
  };

  type QueryBlocksResponse = {
    chain_length : Nat64;
    certificate : ?Blob;
    blocks : [LedgerBlock];
    first_block_index : Nat64;
    archived_blocks : [ArchivedRange];
  };

  transient let icpLedger : actor {
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
    query_blocks : query GetBlocksArgs -> async QueryBlocksResponse;
  } = actor (CREATION_ICP_LEDGER_ID.toText());

  // Cached CMC rate — avoids repeated inter-canister calls.
  var cachedCyclesPerIcp : Nat = CreationLib.DEFAULT_CYCLES_PER_ICP;
  var cachedRateFetchedAt : Int = 0;
  let RATE_CACHE_TTL_NS : Int = 3_600_000_000_000; // 1 hour

  // Per-caller reentrancy guard — ephemeral.
  transient let createInFlight = Map.empty<Principal, Bool>();

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
      case (#Refunded { reason; block_index = bi }) {
        let biText = switch (bi) {
          case (?b) { " (refund block " # b.toText() # ")" };
          case null { "" };
        };
        "Refunded: " # reason # biText
      };
      case (#InvalidTransaction(t)) { "Invalid transaction: " # t };
      case (#Processing) { "Processing, try again shortly" };
      case (#TransactionTooOld(_)) { "Transaction too old for CMC" };
      case (#Other { error_message; error_code = _ }) { error_message };
    }
  };

  func recordFailedCreation(
    blockIndex : CreationTypes.BlockIndex,
    userId : Principal,
    name : Text,
    amountE8s : Nat64,
    lastError : Text,
  ) {
    switch (failedCreations.get(blockIndex)) {
      case (?existing) {
        // Only the owner may refresh metadata.
        if (Principal.equal(existing.userId, userId)) {
          existing.name := name;
          existing.lastError := lastError;
        };
      };
      case null {
        failedCreations.add(blockIndex, {
          blockIndex;
          userId;
          var name;
          amountE8s;
          timestamp = Time.now();
          var lastError;
        });
      };
    };
  };

  func removeFailedCreation(blockIndex : CreationTypes.BlockIndex) {
    failedCreations.remove(blockIndex);
  };

  // CMC notify with correct controller (must be this app) + user as co-controller.
  func notifyCreate(
    blockIndex : Nat64,
    caller : Principal,
  ) : async {
    #ok : Principal;
    #err : Text;
  } {
    try {
      let notifyResult = await cmcActor.notify_create_canister({
        block_index = blockIndex;
        // CMC requires controller == notify caller (this canister).
        controller = selfPrincipal;
        subnet_type = null;
        subnet_selection = null;
        settings = ?{
          controllers = ?[caller, selfPrincipal];
          compute_allocation = null;
          memory_allocation = null;
          freezing_threshold = null;
        };
      });
      switch (notifyResult) {
        case (#Ok(id)) { #ok(id) };
        case (#Err(e)) { #err(notifyErrorText(e)) };
      }
    } catch (err) {
      #err(err.message())
    }
  };

  func trackCreated(
    caller : Principal,
    newCanisterId : Principal,
    name : Text,
    cyclesSeeded : Nat,
    totalIcpE8s : Nat64,
  ) {
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
  };

  // Load one ICP ledger block (main + archived ranges).
  func fetchLedgerBlock(blockIndex : Nat64) : async ?LedgerBlock {
    try {
      let resp = await icpLedger.query_blocks({ start = blockIndex; length = 1 });
      if (resp.blocks.size() > 0) {
        return ?resp.blocks[0]
      };
      // Search archived ranges
      for (range in resp.archived_blocks.values()) {
        if (blockIndex >= range.start and blockIndex < range.start + range.length) {
          let archiveResult = await range.callback({ start = blockIndex; length = 1 });
          switch (archiveResult) {
            case (#Ok({ blocks })) {
              if (blocks.size() > 0) { return ?blocks[0] };
            };
            case (#Err(_)) {};
          };
        };
      };
      null
    } catch (_) {
      null
    }
  };

  // Verify block is a CREA transfer from caller's in-app sub-account to the
  // correct CMC create destination: AccountIdentifier(CMC, Subaccount(app)).
  // Returns net amount e8s on success.
  func verifyCreatePaymentOwnedBy(
    blockIndex : Nat64,
    caller : Principal,
  ) : async CommonTypes.Result<Nat64> {
    let block = switch (await fetchLedgerBlock(blockIndex)) {
      case null {
        return #err(
          "Could not load ledger block " # blockIndex.toText() #
          ". It may be too old to query, or the block index is wrong."
        )
      };
      case (?b) { b };
    };
    let callerSub = LedgerLib.principalToSubaccount(caller);
    let expectedFrom = selfPrincipal.toLedgerAccount(?callerSub);
    // Must match create_canister_txn: CMC + subaccount(controller=app).
    let expectedTo = CreationLib.createPaymentAccountBlob(CREATION_CMC_ID, selfPrincipal);
    // Legacy mistaken destination (CMC default account, no subaccount) — cannot notify.
    let legacyWrongTo = CREATION_CMC_ID.toLedgerAccount(null);

    switch (block.transaction.operation) {
      case (?#Transfer(t)) {
        if (not Blob.equal(t.from, expectedFrom)) {
          return #err("This create payment was not sent from your in-app account")
        };
        if (Blob.equal(t.to, legacyWrongTo)) {
          return #err(
            "This payment used an old incorrect CMC destination account, so " #
            "notify_create_canister cannot succeed. The ICP may be refunded by " #
            "the CMC or remain unusable for create; check your balance for a refund. " #
            "New creates use the correct destination."
          )
        };
        if (not Blob.equal(t.to, expectedTo)) {
          return #err("Payment was not sent to the CMC create-canister account for this app")
        };
        // Accept both LE CREA memo (correct) and legacy BE memo for ownership listing only.
        let memoOk = block.transaction.memo == CreationLib.CREA_MEMO
          or block.transaction.memo == 0x43524541;
        if (not memoOk) {
          return #err("Block is not a create payment (expected CREA memo)")
        };
        #ok(t.amount.e8s)
      };
      case _ {
        #err("Block is not an ICP transfer")
      };
    }
  };

  // ── Public API ──────────────────────────────────────────────────────────

  public shared func getIcpXdrConversionRate() : async Nat {
    await fetchCyclesPerIcp()
  };

  public shared func getCreationCostEstimate(
    seedCyclesIcpE8s : CommonTypes.E8s,
  ) : async CreationTypes.CreationCostEstimate {
    let cyclesPerIcp = await fetchCyclesPerIcp();
    CreationLib.estimateCreationCost(seedCyclesIcpE8s, cyclesPerIcp)
  };

  // List this caller's pending/failed create payments (query — no cycle burn beyond query).
  public shared query ({ caller }) func listFailedCreations() : async [CreationTypes.FailedCreationView] {
    if (caller.isAnonymous()) { Runtime.trap("Anonymous caller not allowed") };
    let buf = List.empty<CreationTypes.FailedCreationView>();
    for ((_, rec) in failedCreations.entries()) {
      if (Principal.equal(rec.userId, caller)) {
        buf.add({
          blockIndex = rec.blockIndex;
          name = rec.name;
          amountE8s = rec.amountE8s;
          timestamp = rec.timestamp;
          lastError = rec.lastError;
        });
      };
    };
    // Newest first
    let arr = buf.toArray();
    arr.sort(
      func(a : CreationTypes.FailedCreationView, b : CreationTypes.FailedCreationView) : Order.Order {
        if (a.timestamp > b.timestamp) { #less }
        else if (a.timestamp < b.timestamp) { #greater }
        else { #equal }
      },
    )
  };

  // Remove a failed-create record from the caller's recovery list.
  // Does not transfer ICP or call CMC — only clears app tracking for entries
  // the user no longer wants (e.g. legacy wrong-destination payments).
  public shared ({ caller }) func dismissFailedCreation(
    blockIndex : CreationTypes.BlockIndex,
  ) : async CommonTypes.Result<()> {
    if (caller.isAnonymous()) {
      return #err("Anonymous caller not allowed")
    };
    switch (failedCreations.get(blockIndex)) {
      case null {
        #err("No failed create found for block " # blockIndex.toText())
      };
      case (?rec) {
        if (not Principal.equal(rec.userId, caller)) {
          return #err("This create payment belongs to another account")
        };
        removeFailedCreation(blockIndex);
        #ok(())
      };
    }
  };

  // Create a new canister funded entirely by the caller's ICP via the CMC.
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

    switch (createInFlight.get(caller)) {
      case (?_) {
        return #err("A canister creation is already in progress for this account")
      };
      case null {
        createInFlight.add(caller, true);
      };
    };

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

      let callerSubaccountBlob = LedgerLib.principalToSubaccount(caller);
      let accountBlob = selfPrincipal.toLedgerAccount(?callerSubaccountBlob);

      let balResult = await icpLedger.account_balance({ account = accountBlob });
      let balance = balResult.e8s;
      if (balance < totalIcpE8s) {
        return #err(
          "Insufficient ICP balance for canister creation. " #
          "Required: " # totalIcpE8s.toText() #
          " e8s, Available: " # balance.toText() # " e8s"
        )
      };

      // CMC create payments MUST go to AccountIdentifier(CMC, Subaccount(controller)).
      // controller = selfPrincipal (this app) for notify authorization.
      // Sending to CMC's default account (null subaccount) causes:
      // "Destination account in the block ... different than in the notification".
      let cmcAccountBlob = CreationLib.createPaymentAccountBlob(CREATION_CMC_ID, selfPrincipal);
      let transferAmount = totalIcpE8s - CreationLib.ICP_FEE_E8S;

      let transferResult = await icpLedger.transfer({
        memo = CreationLib.CREA_MEMO; // 0x41455243 little-endian 'CREA'
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

      // Notify CMC — controller MUST be this app (notify caller).
      switch (await notifyCreate(blockIndex, caller)) {
        case (#err(msg)) {
          // Payment left the account; record for retry without re-paying.
          recordFailedCreation(blockIndex, caller, name, transferAmount, msg);
          return #err(
            "Failed to create canister: " # msg #
            " Your ICP payment is on ledger block " # blockIndex.toText() #
            ". Open Account → Recover failed creates to retry without paying again."
          )
        };
        case (#ok(newCanisterId)) {
          let netE8s = transferAmount.toNat();
          let minted = netE8s * cyclesPerIcp / 100_000_000;
          let cyclesSeeded : Nat = if (minted > CreationLib.CREATION_FEE_CYCLES) {
            minted - CreationLib.CREATION_FEE_CYCLES
          } else { 0 };
          trackCreated(caller, newCanisterId, name, cyclesSeeded, totalIcpE8s);
          removeFailedCreation(blockIndex);
          #ok({ canisterId = newCanisterId; cyclesSeeded })
        };
      }
    } catch (err) {
      #err("Failed to create canister: " # err.message())
    } finally {
      createInFlight.remove(caller);
    }
  };

  // Retry notify_create_canister for a previously recorded failed payment.
  // Does not transfer ICP again.
  public shared ({ caller }) func retryCreateCanister(
    blockIndex : CreationTypes.BlockIndex,
    name : Text,
  ) : async CommonTypes.Result<CreationTypes.CreateCanisterResult> {
    if (caller.isAnonymous()) {
      return #err("Anonymous caller not allowed")
    };
    let effectiveName = if (name.size() > 0) { name } else { "Recovered canister" };

    switch (createInFlight.get(caller)) {
      case (?_) {
        return #err("A canister creation is already in progress for this account")
      };
      case null {
        createInFlight.add(caller, true);
      };
    };

    try {
      let rec = switch (failedCreations.get(blockIndex)) {
        case null {
          return #err(
            "No failed create found for block " # blockIndex.toText() #
            ". If this is an older payment, use claimCreatePayment first."
          )
        };
        case (?r) {
          if (not Principal.equal(r.userId, caller)) {
            return #err("This create payment belongs to another account")
          };
          r
        };
      };

      if (effectiveName.size() > 0) {
        rec.name := effectiveName;
      };

      // Re-check ledger destination — legacy wrong-account payments cannot notify.
      switch (await verifyCreatePaymentOwnedBy(blockIndex, caller)) {
        case (#err(verifyMsg)) {
          rec.lastError := verifyMsg;
          return #err(verifyMsg)
        };
        case (#ok(_)) {};
      };

      switch (await notifyCreate(blockIndex, caller)) {
        case (#err(msg)) {
          rec.lastError := msg;
          // Refunded means ICP returned — drop the pending record.
          if (msg.startsWith(#text "Refunded:")) {
            removeFailedCreation(blockIndex);
          };
          #err(
            "Retry failed: " # msg #
            " Block " # blockIndex.toText() #
            ". If CMC refunded the payment, the ICP should return to your in-app balance."
          )
        };
        case (#ok(newCanisterId)) {
          let cyclesPerIcp = await fetchCyclesPerIcp();
          let netE8s = rec.amountE8s.toNat();
          let minted = netE8s * cyclesPerIcp / 100_000_000;
          let cyclesSeeded : Nat = if (minted > CreationLib.CREATION_FEE_CYCLES) {
            minted - CreationLib.CREATION_FEE_CYCLES
          } else { 0 };
          let grossIcp = rec.amountE8s + CreationLib.ICP_FEE_E8S;
          trackCreated(caller, newCanisterId, rec.name, cyclesSeeded, grossIcp);
          removeFailedCreation(blockIndex);
          #ok({ canisterId = newCanisterId; cyclesSeeded })
        };
      }
    } catch (err) {
      #err("Retry failed: " # err.message())
    } finally {
      createInFlight.remove(caller);
    }
  };

  // Claim a historical CREA payment (e.g. before failed-create recording existed)
  // by verifying the ICP ledger block belongs to the caller's sub-account, then
  // retrying notify. Safe against theft: wrong owner fails verification.
  public shared ({ caller }) func claimCreatePayment(
    blockIndex : CreationTypes.BlockIndex,
    name : Text,
  ) : async CommonTypes.Result<CreationTypes.CreateCanisterResult> {
    if (caller.isAnonymous()) {
      return #err("Anonymous caller not allowed")
    };
    let effectiveName = if (name.size() > 0) { name } else { "Recovered canister" };

    switch (createInFlight.get(caller)) {
      case (?_) {
        return #err("A canister creation is already in progress for this account")
      };
      case null {
        createInFlight.add(caller, true);
      };
    };

    try {
      // If already recorded for another user, reject.
      switch (failedCreations.get(blockIndex)) {
        case (?existing) {
          if (not Principal.equal(existing.userId, caller)) {
            return #err("This block is already claimed by another account")
          };
        };
        case null {};
      };

      let amountE8s = switch (await verifyCreatePaymentOwnedBy(blockIndex, caller)) {
        case (#err(msg)) { return #err(msg) };
        case (#ok(a)) { a };
      };

      recordFailedCreation(
        blockIndex,
        caller,
        effectiveName,
        amountE8s,
        "Claimed for recovery",
      );

      switch (await notifyCreate(blockIndex, caller)) {
        case (#err(msg)) {
          recordFailedCreation(blockIndex, caller, effectiveName, amountE8s, msg);
          if (msg.startsWith(#text "Refunded:")) {
            removeFailedCreation(blockIndex);
          };
          #err(
            "Claim recorded but CMC notify failed: " # msg #
            " Block " # blockIndex.toText() #
            " is saved under Recover failed creates — you can retry later."
          )
        };
        case (#ok(newCanisterId)) {
          let cyclesPerIcp = await fetchCyclesPerIcp();
          let netE8s = amountE8s.toNat();
          let minted = netE8s * cyclesPerIcp / 100_000_000;
          let cyclesSeeded : Nat = if (minted > CreationLib.CREATION_FEE_CYCLES) {
            minted - CreationLib.CREATION_FEE_CYCLES
          } else { 0 };
          let grossIcp = amountE8s + CreationLib.ICP_FEE_E8S;
          trackCreated(caller, newCanisterId, effectiveName, cyclesSeeded, grossIcp);
          removeFailedCreation(blockIndex);
          #ok({ canisterId = newCanisterId; cyclesSeeded })
        };
      }
    } catch (err) {
      #err("Claim failed: " # err.message())
    } finally {
      createInFlight.remove(caller);
    }
  };
};

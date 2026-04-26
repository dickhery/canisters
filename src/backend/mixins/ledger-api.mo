import Map "mo:core/Map";
import List "mo:core/List";
import Nat64 "mo:core/Nat64";
import Array "mo:core/Array";
import Nat8 "mo:core/Nat8";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import CommonTypes "../types/common";
import LedgerTypes "../types/ledger";
import CanisterTypes "../types/canister";
import LedgerLib "../lib/ledger";

// ---------------------------------------------------------------------------
// Ledger / ICP account API mixin
// State slices: selfPrincipal (app canister's own principal), userAccounts,
//               txLog, nextTxId
// ---------------------------------------------------------------------------
mixin (
  selfPrincipal : Principal,
  userAccounts : Map.Map<CommonTypes.UserId, LedgerTypes.UserAccount>,
  txLog : List.List<LedgerTypes.Transaction>,
  nextTxId : { var value : Nat },
) {
  let ICP_LEDGER_ID = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
  let CMC_ID        = Principal.fromText("rkp4c-7iaaa-aaaaa-aaaca-cai");
  // ICP transfer fee: 0.0001 ICP = 10,000 e8s
  let ICP_FEE_E8S : Nat64 = 10_000;

  // ---------------------------------------------------------------------------
  // getMyAccount — derives or returns the caller's ICP sub-account
  // ---------------------------------------------------------------------------
  public shared ({ caller }) func getMyAccount() : async LedgerTypes.UserAccount {
    if (caller.isAnonymous()) { Runtime.trap("Anonymous caller not allowed") };
    switch (userAccounts.get(caller)) {
      case (?acc) { acc };
      case null {
        let acc = LedgerLib.userAccount(selfPrincipal, caller);
        userAccounts.add(caller, acc);
        acc
      };
    }
  };

  // ---------------------------------------------------------------------------
  // getMyBalance — queries ICP ledger for the caller's sub-account balance
  // ---------------------------------------------------------------------------
  public shared ({ caller }) func getMyBalance() : async LedgerTypes.E8s {
    if (caller.isAnonymous()) { Runtime.trap("Anonymous caller not allowed") };
    let sub = LedgerLib.principalToSubaccount(caller);
    let accountBlob = selfPrincipal.toLedgerAccount(?sub);
    let ledger = actor (ICP_LEDGER_ID.toText()) : actor {
      account_balance : query { account : Blob } -> async { e8s : Nat64 };
    };
    let result = await ledger.account_balance({ account = accountBlob });
    result.e8s
  };

  // ---------------------------------------------------------------------------
  // topUpCanister — transfers ICP to CMC, notifies to mint cycles for canister
  // ---------------------------------------------------------------------------
  public shared ({ caller }) func topUpCanister(
    canisterId : CanisterTypes.CanisterId,
    icpAmountE8s : LedgerTypes.E8s,
  ) : async CommonTypes.Result<CommonTypes.Cycles> {
    if (caller.isAnonymous()) {
      return #err("Anonymous caller not allowed")
    };
    if (icpAmountE8s <= ICP_FEE_E8S) {
      return #err("Amount must be greater than the transfer fee (10,000 e8s)")
    };

    try {
      let callerSubaccount = LedgerLib.principalToSubaccount(caller);
      // CMC top-up destination: CMC's account for the target canister
      let cmcSubaccount = LedgerLib.principalToSubaccount(canisterId);
      let cmcAccountBlob = CMC_ID.toLedgerAccount(?cmcSubaccount);

      let ledger = actor (ICP_LEDGER_ID.toText()) : actor {
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
        amount = { e8s = icpAmountE8s - ICP_FEE_E8S };
        fee = { e8s = ICP_FEE_E8S };
        from_subaccount = ?callerSubaccount;
        to = cmcAccountBlob;
        created_at_time = null;
      });

      switch (transferResult) {
        case (#Err(e)) {
          let msg = switch (e) {
            case (#InsufficientFunds { balance }) {
              "Insufficient funds. Balance: " # balance.e8s.toText() # " e8s"
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
          #err(msg)
        };
        case (#Ok(blockIndex)) {
          let cmc = actor (CMC_ID.toText()) : actor {
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
          let notifyResult = await cmc.notify_top_up({
            block_index = blockIndex;
            canister_id = canisterId;
          });
          switch (notifyResult) {
            case (#Err(e)) {
              let msg = switch (e) {
                case (#Refunded { reason; block_index = _ }) { "Refunded: " # reason };
                case (#InvalidTransaction(t))               { "Invalid transaction: " # t };
                case (#Processing)                          { "Processing, try again" };
                case (#TransactionTooOld(_))                { "Transaction too old for CMC" };
                case (#Other { error_message; error_code = _ }) { error_message };
              };
              #err(msg)
            };
            case (#Ok(cyclesAdded)) {
              ignore LedgerLib.recordTransaction(
                txLog,
                nextTxId.value,
                caller,
                #topUp { canisterId; cyclesAdded },
                icpAmountE8s,
                "Top-up canister " # canisterId.toText(),
                Time.now(),
              );
              nextTxId.value += 1;
              #ok(cyclesAdded)
            };
          }
        };
      }
    } catch (err) {
      #err("Unexpected error during top-up: " # errorMessage(err))
    }
  };

  // ---------------------------------------------------------------------------
  // transferIcp — sends ICP from the caller's sub-account to an external account
  // ---------------------------------------------------------------------------
  public shared ({ caller }) func transferIcp(
    toAccountId : Text,
    amountE8s : LedgerTypes.E8s,
    memo : Text,
  ) : async CommonTypes.Result<Nat64> {
    if (caller.isAnonymous()) {
      return #err("Anonymous caller not allowed")
    };
    if (amountE8s <= ICP_FEE_E8S) {
      return #err("Amount must be greater than the transfer fee (10,000 e8s)")
    };

    let toAccountBlob = switch (hexToBlob(toAccountId)) {
      case (?b) { b };
      case null { return #err("Invalid account ID: must be a 64-character hex string") };
    };

    try {
      let callerSubaccount = LedgerLib.principalToSubaccount(caller);
      let ledger = actor (ICP_LEDGER_ID.toText()) : actor {
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
        memo = 0;
        amount = { e8s = amountE8s - ICP_FEE_E8S };
        fee = { e8s = ICP_FEE_E8S };
        from_subaccount = ?callerSubaccount;
        to = toAccountBlob;
        created_at_time = null;
      });

      switch (transferResult) {
        case (#Err(e)) {
          let msg = switch (e) {
            case (#InsufficientFunds { balance }) {
              "Insufficient funds. Balance: " # balance.e8s.toText() # " e8s"
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
          #err(msg)
        };
        case (#Ok(blockIndex)) {
          ignore LedgerLib.recordTransaction(
            txLog,
            nextTxId.value,
            caller,
            #icpTransfer { toAccountId },
            amountE8s,
            memo,
            Time.now(),
          );
          nextTxId.value += 1;
          #ok(blockIndex)
        };
      }
    } catch (err) {
      #err("Unexpected error during transfer: " # errorMessage(err))
    }
  };

  // ---------------------------------------------------------------------------
  // getTransactionHistory — paginated transaction log for the caller
  // ---------------------------------------------------------------------------
  public shared ({ caller }) func getTransactionHistory(
    page : Nat,
  ) : async CommonTypes.Page<LedgerTypes.Transaction> {
    if (caller.isAnonymous()) { Runtime.trap("Anonymous caller not allowed") };
    LedgerLib.listTransactions(txLog, caller, page, 20)
  };

  // ---------------------------------------------------------------------------
  // hexToBlob — decode a 64-char hex string into a 32-byte Blob
  // Returns null if the input is not exactly 64 valid hex characters.
  // ---------------------------------------------------------------------------
  func hexToBlob(hex : Text) : ?Blob {
    let chars = hex.toArray();
    if (chars.size() != 64) { return null };
    // Validate all characters are valid hex before converting
    for (c in chars.values()) {
      if (not isHexChar(c)) { return null }
    };
    let bytes = Array.tabulate(32, func(i) : Nat8 {
      let hi = hexNibble(chars[i * 2]);
      let lo = hexNibble(chars[i * 2 + 1]);
      Nat8.fromNat(hi * 16 + lo)
    });
    ?Blob.fromArray(bytes)
  };

  func isHexChar(c : Char) : Bool {
    (c >= '0' and c <= '9') or (c >= 'a' and c <= 'f') or (c >= 'A' and c <= 'F')
  };

  func hexNibble(c : Char) : Nat {
    if (c >= '0' and c <= '9') {
      (Char.toNat32(c) - Char.toNat32('0')).toNat()
    } else if (c >= 'a' and c <= 'f') {
      (Char.toNat32(c) - Char.toNat32('a')).toNat() + 10
    } else if (c >= 'A' and c <= 'F') {
      (Char.toNat32(c) - Char.toNat32('A')).toNat() + 10
    } else { 0 }
  };

  // ---------------------------------------------------------------------------
  // errorMessage — extract a text description from a caught Error
  // ---------------------------------------------------------------------------
  func errorMessage(err : Error) : Text {
    Error.message(err)
  };
};

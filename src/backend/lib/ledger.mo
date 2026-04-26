import List "mo:core/List";
import Array "mo:core/Array";
import Nat8 "mo:core/Nat8";
import Nat "mo:core/Nat";
import Types "../types/ledger";
import CommonTypes "../types/common";

module {
  // ---------------------------------------------------------------------------
  // principalToSubaccount
  // Derives a deterministic 32-byte subaccount blob from a principal.
  // Layout: [len, b0..b_len, 0, 0, ...] padded to 32 bytes.
  // ---------------------------------------------------------------------------
  public func principalToSubaccount(userId : Types.UserId) : Blob {
    let principalBytes = userId.toBlob();
    let bytes = Blob.toArray(principalBytes);
    let len = bytes.size();
    let subBytes = Array.tabulate<Nat8>(32, func(i) {
      if (i == 0) { Nat8.fromNat(len) }
      else if (i <= len) { bytes[i - 1] }
      else { 0 }
    });
    Blob.fromArray(subBytes)
  };

  // ---------------------------------------------------------------------------
  // accountIdFromSubaccount
  // Returns the 64-char hex ICP account identifier for `canisterId` on
  // the given subaccount, using `Principal.toLedgerAccount` (CRC32 + SHA224).
  // ---------------------------------------------------------------------------
  public func accountIdFromSubaccount(canisterId : Principal, subaccount : Blob) : Text {
    let accountBlob = canisterId.toLedgerAccount(?subaccount);
    blobToHex(accountBlob)
  };

  // ---------------------------------------------------------------------------
  // userAccount
  // ---------------------------------------------------------------------------
  public func userAccount(canisterId : Principal, userId : Types.UserId) : Types.UserAccount {
    let sub = principalToSubaccount(userId);
    let accId = accountIdFromSubaccount(canisterId, sub);
    { userId; accountId = accId; subaccount = sub }
  };

  // ---------------------------------------------------------------------------
  // recordTransaction
  // Appends a new Transaction to txLog and returns it.
  // ---------------------------------------------------------------------------
  public func recordTransaction(
    txLog : List.List<Types.Transaction>,
    nextId : Nat,
    userId : Types.UserId,
    kind : Types.TxKind,
    amountE8s : Types.E8s,
    memo : Text,
    now : Types.Timestamp,
  ) : Types.Transaction {
    let tx : Types.Transaction = {
      id = nextId;
      userId;
      kind;
      amountE8s;
      timestamp = now;
      memo;
    };
    txLog.add(tx);
    tx
  };

  // ---------------------------------------------------------------------------
  // listTransactions
  // Returns a paginated view of the caller's transactions, newest first.
  // ---------------------------------------------------------------------------
  public func listTransactions(
    txLog : List.List<Types.Transaction>,
    userId : Types.UserId,
    page : Nat,
    pageSize : Nat,
  ) : CommonTypes.Page<Types.Transaction> {
    let all = txLog.filter(func(tx : Types.Transaction) : Bool {
      Principal.equal(tx.userId, userId)
    });
    let reversed = all.reverse();
    let total = reversed.size();
    let effectivePageSize = if (pageSize == 0) { 20 } else { pageSize };
    let start = page * effectivePageSize;
    let items : [Types.Transaction] = if (start >= total) {
      []
    } else {
      let end = Nat.min(start + effectivePageSize, total);
      reversed.sliceToArray(start, end)
    };
    { items; total; page; pageSize = effectivePageSize }
  };

  // ---------------------------------------------------------------------------
  // Hex encoding helper
  // ---------------------------------------------------------------------------
  func blobToHex(b : Blob) : Text {
    let bytes = Blob.toArray(b);
    let hexChars = "0123456789abcdef".toArray();
    let chars = Array.tabulate(bytes.size() * 2, func(i) : Char {
      let byte = bytes[i / 2];
      let nibble = if (i % 2 == 0) {
        byte.toNat() / 16
      } else {
        byte.toNat() % 16
      };
      hexChars[nibble]
    });
    Text.fromArray(chars)
  };
};

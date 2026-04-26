import CommonTypes "common";

module {
  public type UserId = CommonTypes.UserId;
  public type Timestamp = CommonTypes.Timestamp;
  public type E8s = CommonTypes.E8s;

  // Kind of ledger transaction
  public type TxKind = {
    #topUp : { canisterId : Principal; cyclesAdded : CommonTypes.Cycles };
    #icpTransfer : { toAccountId : Text };
  };

  // An immutable transaction record
  public type Transaction = {
    id : Nat;
    userId : UserId;
    kind : TxKind;
    amountE8s : E8s;
    timestamp : Timestamp;
    memo : Text;
  };

  // Per-user ICP account info
  public type UserAccount = {
    userId : UserId;
    accountId : Text; // hex-encoded ICP account identifier
    subaccount : Blob; // 32-byte subaccount derived from user principal
  };
};

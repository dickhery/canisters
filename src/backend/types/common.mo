module {
  public type UserId = Principal;
  public type Timestamp = Int; // nanoseconds since epoch (Time.now())
  public type CanisterId = Principal;
  public type E8s = Nat64; // ICP in e8s (1 ICP = 100_000_000 e8s)
  public type Cycles = Nat;

  // Pagination
  public type Page<T> = {
    items : [T];
    total : Nat;
    page : Nat;
    pageSize : Nat;
  };

  // Generic result type for operations that may fail with a message
  public type Result<T> = {
    #ok : T;
    #err : Text;
  };
};

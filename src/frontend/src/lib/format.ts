/**
 * Format utilities for cycles, ICP, principals, and timestamps.
 */

/**
 * Format a cycle count (bigint | number) into a human-readable string.
 * Uses purely BigInt arithmetic to avoid floating-point precision loss
 * with very large values (> Number.MAX_SAFE_INTEGER).
 * e.g. 1_200_000_000_000n → "1.2T", 500_000_000_000n → "500B"
 */
export function formatCycles(cycles: bigint | number): string {
  const n: bigint =
    typeof cycles === "bigint" ? cycles : BigInt(Math.round(cycles));

  const T = 1_000_000_000_000n;
  const B = 1_000_000_000n;
  const M = 1_000_000n;
  const K = 1_000n;

  if (n >= T) {
    const whole = n / T;
    const rem = n % T;
    return rem === 0n ? `${whole}T` : `${whole}.${_leadingDigit(rem, T)}T`;
  }
  if (n >= B) {
    const whole = n / B;
    const rem = n % B;
    return rem === 0n ? `${whole}B` : `${whole}.${_leadingDigit(rem, B)}B`;
  }
  if (n >= M) {
    const whole = n / M;
    const rem = n % M;
    return rem === 0n ? `${whole}M` : `${whole}.${_leadingDigit(rem, M)}M`;
  }
  if (n >= K) {
    const whole = n / K;
    const rem = n % K;
    return rem === 0n ? `${whole}K` : `${whole}.${_leadingDigit(rem, K)}K`;
  }
  return n.toString();
}

/** Return the first significant digit after the decimal point for a unit. */
function _leadingDigit(remainder: bigint, unit: bigint): string {
  // Multiply remainder by 10 to get the first decimal digit
  return ((remainder * 10n) / unit).toString();
}

/**
 * Format E8s (bigint) to ICP amount with up to 8 decimal places.
 * e.g. 7843000000n → "78.43"
 */
export function formatIcp(e8s: bigint): string {
  const whole = e8s / 100_000_000n;
  const frac = e8s % 100_000_000n;
  if (frac === 0n) return whole.toString();
  const fracStr = frac.toString().padStart(8, "0").replace(/0+$/, "");
  return `${whole}.${fracStr}`;
}

/**
 * Truncate a principal ID string for display.
 * e.g. "x4s2...p9w1" keeping 4 chars at start and 4 at end.
 */
export function truncatePrincipal(
  principal: string,
  startChars = 4,
  endChars = 4,
): string {
  if (principal.length <= startChars + endChars + 3) return principal;
  return `${principal.slice(0, startChars)}...${principal.slice(-endChars)}`;
}

/**
 * Truncate an account ID (hex) for display.
 * e.g. "abc123...def789"
 */
export function truncateAccountId(
  accountId: string,
  startChars = 6,
  endChars = 6,
): string {
  if (accountId.length <= startChars + endChars + 3) return accountId;
  return `${accountId.slice(0, startChars)}...${accountId.slice(-endChars)}`;
}

/**
 * Format a bigint timestamp (nanoseconds from IC) or millisecond timestamp to a readable date/time.
 */
export function formatTimestamp(timestamp: bigint | number): string {
  let ms: number;
  if (typeof timestamp === "bigint") {
    // IC timestamps are in nanoseconds
    ms = Number(timestamp / 1_000_000n);
  } else {
    ms = timestamp;
  }
  const date = new Date(ms);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a bigint timestamp to relative time (e.g. "3 hours ago").
 */
export function formatRelativeTime(timestamp: bigint | number): string {
  let ms: number;
  if (typeof timestamp === "bigint") {
    ms = Number(timestamp / 1_000_000n);
  } else {
    ms = timestamp;
  }
  const diff = Date.now() - ms;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

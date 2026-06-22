/**
 * ICP → cycles estimation helpers.
 * Mirrors backend logic in canister-creation.mo (net ICP after transfer fee).
 */

/** Standard ICP ledger transfer fee: 10_000 e8s = 0.0001 ICP */
export const ICP_TRANSFER_FEE_E8S = 10_000n;

/**
 * Conservative fallback when the live CMC rate is unavailable.
 * Slightly below typical mainnet rates so estimates do not overpromise.
 */
export const FALLBACK_CYCLES_PER_ICP = 1_500_000_000_000n;

/** Parse a decimal ICP input string into e8s (max 8 fractional digits). */
export function parseIcpInput(raw: string): bigint {
  if (!raw || raw === "0" || raw === "") return 0n;
  const trimmed = raw.trim();
  const match = trimmed.match(/^(\d+)(?:\.(\d{1,8}))?$/);
  if (!match) return 0n;
  const whole = BigInt(match[1]);
  const fracStr = (match[2] ?? "").padEnd(8, "0").slice(0, 8);
  const frac = BigInt(fracStr);
  return whole * 100_000_000n + frac;
}

/**
 * Estimate cycles minted for a top-up.
 * icpAmountE8s is the total ICP the user spends (gross); the CMC receives
 * icpAmountE8s minus one transfer fee, matching topUpCanister on the backend.
 */
export function estimateTopUpCycles(
  icpAmountE8s: bigint,
  cyclesPerIcp: bigint,
): bigint {
  if (icpAmountE8s <= ICP_TRANSFER_FEE_E8S) return 0n;
  const netIcpE8s = icpAmountE8s - ICP_TRANSFER_FEE_E8S;
  return (netIcpE8s * cyclesPerIcp) / 100_000_000n;
}

/** Format cycles-per-ICP for display (e.g. "1.65T"). */
export function formatCyclesPerIcp(cyclesPerIcp: bigint): string {
  const trillions = Number(cyclesPerIcp) / 1e12;
  return `${trillions.toFixed(2)}T`;
}

/** Mirrors backend estimateCreationCost — computed client-side to avoid CMC calls. */
export function estimateCreationCost(
  seedIcpE8s: bigint,
  cyclesPerIcp: bigint,
): {
  creationFeeIcpE8s: bigint;
  transferFeeE8s: bigint;
  totalIcpRequiredE8s: bigint;
  estimatedSeedCycles: bigint;
  cyclesPerIcp: bigint;
} {
  const totalIcpRequiredE8s =
    seedIcpE8s > 0n ? seedIcpE8s + ICP_TRANSFER_FEE_E8S : 0n;
  return {
    creationFeeIcpE8s: 0n,
    transferFeeE8s: ICP_TRANSFER_FEE_E8S,
    totalIcpRequiredE8s,
    estimatedSeedCycles: estimateTopUpCycles(seedIcpE8s, cyclesPerIcp),
    cyclesPerIcp,
  };
}
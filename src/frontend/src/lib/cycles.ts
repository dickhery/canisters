/**
 * ICP → cycles estimation helpers.
 * Mirrors backend logic in canister-creation.mo (CMC-funded create + top-up).
 */

/** Standard ICP ledger transfer fee: 10_000 e8s = 0.0001 ICP */
export const ICP_TRANSFER_FEE_E8S = 10_000n;

/** Protocol canister creation fee in cycles (500B). */
export const CREATION_FEE_CYCLES = 500_000_000_000n;

/** Min residual cycles after creation fee so empty canisters can allocate memory. */
export const MIN_INITIAL_CYCLES = 100_000_000_000n;

/** Total cycles the ICP payment must mint at minimum. */
export const MIN_CREATE_CYCLES = CREATION_FEE_CYCLES + MIN_INITIAL_CYCLES;

/**
 * Conservative fallback when the live CMC rate is unavailable.
 * Slightly below typical mainnet rates so estimates do not overpromise.
 */
export const FALLBACK_CYCLES_PER_ICP = 1_500_000_000_000n;

/** Fallback minimum creation ICP (~0.5 ICP) when rate is unavailable. */
export const FALLBACK_MIN_CREATION_ICP_E8S = 50_000_000n;

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
 * Minimum ICP (gross) so CMC can mint MIN_CREATE_CYCLES after the ledger fee.
 * Mirrors backend minCreationIcpE8s (+5% buffer, +fee, floor at fallback).
 */
export function minCreationIcpE8s(cyclesPerIcp: bigint): bigint {
  if (cyclesPerIcp <= 0n) return FALLBACK_MIN_CREATION_ICP_E8S;
  const raw =
    (MIN_CREATE_CYCLES * 100_000_000n + cyclesPerIcp - 1n) / cyclesPerIcp;
  const withBuffer = raw + raw / 20n;
  const gross = withBuffer + ICP_TRANSFER_FEE_E8S;
  return gross < FALLBACK_MIN_CREATION_ICP_E8S
    ? FALLBACK_MIN_CREATION_ICP_E8S
    : gross;
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

/**
 * Mirrors backend estimateCreationCost — CMC-funded create.
 * totalIcpRequired = base creation min + optional seed (gross, top-up style).
 * estimatedSeedCycles = residual on new canister after protocol creation fee.
 */
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
  const creationFeeIcpE8s = minCreationIcpE8s(cyclesPerIcp);
  const totalIcpRequiredE8s = creationFeeIcpE8s + seedIcpE8s;
  const minted = estimateTopUpCycles(totalIcpRequiredE8s, cyclesPerIcp);
  const estimatedSeedCycles =
    minted > CREATION_FEE_CYCLES ? minted - CREATION_FEE_CYCLES : 0n;
  return {
    creationFeeIcpE8s,
    transferFeeE8s: ICP_TRANSFER_FEE_E8S,
    totalIcpRequiredE8s,
    estimatedSeedCycles,
    cyclesPerIcp,
  };
}

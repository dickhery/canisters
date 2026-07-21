import { c as createLucideIcon, j as jsxRuntimeExports, m as cn } from "./index-CQ9sjVFl.js";
import { C as CanisterStatus } from "./index-DhWlHdoS.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
];
const Pencil = createLucideIcon("pencil", __iconNode);
const STATUS_CONFIG = {
  [CanisterStatus.running]: {
    label: "ONLINE",
    dotClass: "bg-accent animate-blink",
    badgeClass: "border-accent/60 text-accent bg-accent/10",
    glowClass: "retro-glow-accent"
  },
  [CanisterStatus.stopped]: {
    label: "OFFLINE",
    dotClass: "bg-destructive",
    badgeClass: "border-destructive/60 text-destructive bg-destructive/10",
    glowClass: ""
  },
  [CanisterStatus.stopping]: {
    label: "HALTING",
    dotClass: "bg-primary animate-blink",
    badgeClass: "border-primary/60 text-primary bg-primary/10",
    glowClass: "retro-glow-sm"
  }
};
function StatusBadge({
  status,
  className,
  blinkDelay
}) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG[CanisterStatus.stopped];
  const needsDelay = status === CanisterStatus.running || status === CanisterStatus.stopping;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[10px] font-bold border tracking-[0.2em] uppercase",
        config.badgeClass,
        config.glowClass,
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: cn("h-1.5 w-1.5 shrink-0", config.dotClass),
            style: needsDelay && blinkDelay !== void 0 ? { animationDelay: `${blinkDelay}s` } : void 0,
            "aria-hidden": "true"
          }
        ),
        "[",
        config.label,
        "]"
      ]
    }
  );
}
const ICP_TRANSFER_FEE_E8S = 10000n;
const CREATION_FEE_CYCLES = 500000000000n;
const MIN_INITIAL_CYCLES = 100000000000n;
const MIN_CREATE_CYCLES = CREATION_FEE_CYCLES + MIN_INITIAL_CYCLES;
const FALLBACK_CYCLES_PER_ICP = 1500000000000n;
const FALLBACK_MIN_CREATION_ICP_E8S = 50000000n;
function parseIcpInput(raw) {
  if (!raw || raw === "0" || raw === "") return 0n;
  const trimmed = raw.trim();
  const match = trimmed.match(/^(\d+)(?:\.(\d{1,8}))?$/);
  if (!match) return 0n;
  const whole = BigInt(match[1]);
  const fracStr = (match[2] ?? "").padEnd(8, "0").slice(0, 8);
  const frac = BigInt(fracStr);
  return whole * 100000000n + frac;
}
function minCreationIcpE8s(cyclesPerIcp) {
  if (cyclesPerIcp <= 0n) return FALLBACK_MIN_CREATION_ICP_E8S;
  const raw = (MIN_CREATE_CYCLES * 100000000n + cyclesPerIcp - 1n) / cyclesPerIcp;
  const withBuffer = raw + raw / 20n;
  const gross = withBuffer + ICP_TRANSFER_FEE_E8S;
  return gross < FALLBACK_MIN_CREATION_ICP_E8S ? FALLBACK_MIN_CREATION_ICP_E8S : gross;
}
function estimateTopUpCycles(icpAmountE8s, cyclesPerIcp) {
  if (icpAmountE8s <= ICP_TRANSFER_FEE_E8S) return 0n;
  const netIcpE8s = icpAmountE8s - ICP_TRANSFER_FEE_E8S;
  return netIcpE8s * cyclesPerIcp / 100000000n;
}
function formatCyclesPerIcp(cyclesPerIcp) {
  const trillions = Number(cyclesPerIcp) / 1e12;
  return `${trillions.toFixed(2)}T`;
}
function estimateCreationCost(seedIcpE8s, cyclesPerIcp) {
  const creationFeeIcpE8s = minCreationIcpE8s(cyclesPerIcp);
  const totalIcpRequiredE8s = creationFeeIcpE8s + seedIcpE8s;
  const minted = estimateTopUpCycles(totalIcpRequiredE8s, cyclesPerIcp);
  const estimatedSeedCycles = minted > CREATION_FEE_CYCLES ? minted - CREATION_FEE_CYCLES : 0n;
  return {
    creationFeeIcpE8s,
    transferFeeE8s: ICP_TRANSFER_FEE_E8S,
    totalIcpRequiredE8s,
    estimatedSeedCycles,
    cyclesPerIcp
  };
}
export {
  FALLBACK_CYCLES_PER_ICP as F,
  ICP_TRANSFER_FEE_E8S as I,
  Pencil as P,
  StatusBadge as S,
  estimateCreationCost as a,
  estimateTopUpCycles as e,
  formatCyclesPerIcp as f,
  parseIcpInput as p
};

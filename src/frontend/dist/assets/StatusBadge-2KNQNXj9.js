import { c as createLucideIcon, j as jsxRuntimeExports, m as cn } from "./index-BMS8nT-t.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
];
const Pencil = createLucideIcon("pencil", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
];
const Trash2 = createLucideIcon("trash-2", __iconNode);
var CanisterStatus = /* @__PURE__ */ ((CanisterStatus2) => {
  CanisterStatus2["stopped"] = "stopped";
  CanisterStatus2["stopping"] = "stopping";
  CanisterStatus2["running"] = "running";
  return CanisterStatus2;
})(CanisterStatus || {});
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
export {
  Pencil as P,
  StatusBadge as S,
  Trash2 as T
};

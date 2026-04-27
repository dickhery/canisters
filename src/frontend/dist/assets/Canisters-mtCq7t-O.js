import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, n as formatIcp, o as formatCycles, B as Button, T as Terminal, X, p as useNavigate, C as CopyableId, q as formatTimestamp, m as cn } from "./index-BMS8nT-t.js";
import { P as PaginationControls } from "./PaginationControls-DyF9oby2.js";
import { S as StatusBadge, T as Trash2, P as Pencil } from "./StatusBadge-2KNQNXj9.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-Dxty3jP1.js";
import { u as useGetCreationCostEstimate, a as useGetMyBalance, b as useCreateCanister, L as Label, I as Input, c as useListCanisters, d as useSearchCanisters, S as Skeleton, e as useAddCanister, f as useRemoveCanister, g as useRenameCanister } from "./index-STxetVaD.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  [
    "path",
    {
      d: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",
      key: "hh9hay"
    }
  ],
  ["path", { d: "m3.3 7 8.7 5 8.7-5", key: "g66t2b" }],
  ["path", { d: "M12 22V12", key: "d0xqtd" }]
];
const Box = createLucideIcon("box", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M8 12h8", key: "1wcyev" }],
  ["path", { d: "M12 8v8", key: "napkw2" }]
];
const CirclePlus = createLucideIcon("circle-plus", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m21 21-4.34-4.34", key: "14j7rj" }],
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }]
];
const Search = createLucideIcon("search", __iconNode);
const FALLBACK_CYCLES_PER_ICP = 10000000000000n;
const CREATION_FEE_DISPLAY_E8S = 100000000n;
const TRANSFER_FEE_E8S = 10000n;
function icpToEstimatedCycles(icpE8s, cyclesPerIcp) {
  return icpE8s * cyclesPerIcp / 100000000n;
}
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
function CreateCanisterModal({
  open,
  onClose
}) {
  const [name, setName] = reactExports.useState("");
  const [seedIcpRaw, setSeedIcpRaw] = reactExports.useState("0");
  const [nameError, setNameError] = reactExports.useState("");
  const seedIcpE8s = parseIcpInput(seedIcpRaw);
  const seedCyclesIcpE8sNum = Number(seedIcpE8s);
  const { data: estimate, isLoading: estimateLoading } = useGetCreationCostEstimate(seedCyclesIcpE8sNum);
  const { data: balance } = useGetMyBalance();
  const { mutate, isPending, data: createResult, reset } = useCreateCanister();
  const cyclesPerIcp = (estimate == null ? void 0 : estimate.cyclesPerIcp) && estimate.cyclesPerIcp > 0n ? estimate.cyclesPerIcp : FALLBACK_CYCLES_PER_ICP;
  const creationFeeE8s = (estimate == null ? void 0 : estimate.creationFeeIcpE8s) ?? CREATION_FEE_DISPLAY_E8S;
  const transferFeeE8s = (estimate == null ? void 0 : estimate.transferFeeE8s) ?? TRANSFER_FEE_E8S;
  const totalIcpRequiredE8s = (estimate == null ? void 0 : estimate.totalIcpRequiredE8s) ?? creationFeeE8s + seedIcpE8s + transferFeeE8s;
  const seedCycles = (estimate == null ? void 0 : estimate.estimatedSeedCycles) != null && seedIcpE8s > 0n ? estimate.estimatedSeedCycles : icpToEstimatedCycles(seedIcpE8s, cyclesPerIcp);
  const userBalance = balance ?? 0n;
  const canAfford = userBalance >= totalIcpRequiredE8s;
  const nameValid = name.trim().length > 0;
  const canSubmit = nameValid && canAfford && !isPending;
  const usingFallbackRate = !estimateLoading && (!(estimate == null ? void 0 : estimate.cyclesPerIcp) || estimate.cyclesPerIcp === 0n);
  reactExports.useEffect(() => {
    if (!open) {
      setName("");
      setSeedIcpRaw("0");
      setNameError("");
      reset();
    }
  }, [open, reset]);
  reactExports.useEffect(() => {
    if (createResult) {
      onClose();
    }
  }, [createResult, onClose]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("CANISTER NAME IS REQUIRED.");
      return;
    }
    setNameError("");
    mutate({ name: name.trim(), seedCyclesIcpE8s: seedCyclesIcpE8sNum });
  };
  const handleClose = () => {
    if (!isPending) onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && handleClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "sm:max-w-lg bg-card border-primary/40 font-mono",
      "data-ocid": "create_canister.dialog",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-base tracking-[0.2em] text-primary uppercase retro-glow-sm", children: ">_ CREATE NEW CANISTER" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "font-mono text-[10px] text-muted-foreground tracking-[0.12em]", children: "PROVISION A NEW CANISTER ON THE INTERNET COMPUTER. ICP WILL BE DEDUCTED FROM YOUR IN-APP BALANCE." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-primary/20 bg-background/60 p-3 space-y-2 text-[10px] font-mono tracking-[0.1em]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[9px] text-primary/40 tracking-widest select-none mb-1", children: "┌─[ COST ESTIMATE ]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground uppercase", children: "BASE CREATION FEE" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary tabular-nums retro-glow-sm", children: [
              formatIcp(creationFeeE8s),
              " ICP"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground uppercase", children: "SEED CYCLES ICP" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary tabular-nums", children: [
              formatIcp(seedIcpE8s),
              " ICP"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground uppercase", children: "TRANSFER FEE" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary/60 tabular-nums text-[9px]", children: [
              formatIcp(transferFeeE8s),
              " ICP"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-primary/20 pt-2 flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground uppercase font-bold", children: "TOTAL REQUIRED" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `font-bold tabular-nums retro-glow-sm ${canAfford ? "text-primary" : "text-destructive"}`,
                children: estimateLoading ? "CALCULATING…" : `${formatIcp(totalIcpRequiredE8s)} ICP`
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pt-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground uppercase", children: "YOUR BALANCE" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "span",
              {
                className: `tabular-nums ${canAfford ? "text-muted-foreground" : "text-destructive"}`,
                children: [
                  formatIcp(userBalance),
                  " ICP"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pt-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/60 uppercase text-[9px]", children: "CONVERSION RATE" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/60 tabular-nums text-[9px]", children: estimateLoading ? "FETCHING…" : usingFallbackRate ? `~${(Number(FALLBACK_CYCLES_PER_ICP) / 1e12).toFixed(1)}T cycles/ICP (est)` : `${(Number(cyclesPerIcp) / 1e12).toFixed(2)}T cycles/ICP` })
          ] }),
          !canAfford && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: "font-mono text-[9px] text-destructive uppercase tracking-wider pt-1",
              "data-ocid": "create_canister.balance_error",
              children: "⚠ INSUFFICIENT BALANCE — DEPOSIT MORE ICP TO YOUR ACCOUNT"
            }
          ),
          usingFallbackRate && !estimateLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] text-muted-foreground/50 uppercase tracking-wider pt-1", children: "* RATE IS ESTIMATED — LIVE RATE UNAVAILABLE" }),
          seedIcpE8s > 0n && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-primary/10 pt-2 flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground uppercase text-[9px]", children: "APPROX CYCLES SEEDED" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-accent text-[9px] tabular-nums retro-glow-accent", children: [
              "~",
              formatCycles(seedCycles)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Label,
              {
                htmlFor: "canister-create-name",
                className: "font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]",
                children: [
                  "CANISTER NAME ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "canister-create-name",
                placeholder: "e.g. My Token Ledger",
                value: name,
                onChange: (e) => {
                  setName(e.target.value);
                  if (nameError) setNameError("");
                },
                className: "font-mono text-sm bg-background border-primary/30 focus:border-primary uppercase placeholder:normal-case",
                "data-ocid": "create_canister.name_input",
                autoFocus: true,
                disabled: isPending
              }
            ),
            nameError && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "font-mono text-[10px] text-destructive uppercase tracking-wider",
                "data-ocid": "create_canister.name_field_error",
                children: nameError
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Label,
              {
                htmlFor: "canister-seed-icp",
                className: "font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]",
                children: [
                  "SEED CYCLES (ICP)",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/50 font-normal", children: "(OPT)" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  id: "canister-seed-icp",
                  placeholder: "0",
                  value: seedIcpRaw,
                  onChange: (e) => setSeedIcpRaw(e.target.value),
                  className: "font-mono text-sm bg-background border-primary/30 focus:border-primary w-36 tabular-nums",
                  "data-ocid": "create_canister.seed_icp_input",
                  disabled: isPending
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-muted-foreground uppercase", children: "ICP" }),
              seedIcpE8s > 0n && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[10px] text-accent/80 tabular-nums retro-glow-accent", children: [
                "≈",
                " ",
                formatCycles(icpToEstimatedCycles(seedIcpE8s, cyclesPerIcp)),
                " ",
                "cycles"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] text-muted-foreground/60 tracking-wider", children: "ENTER ADDITIONAL ICP TO TOP UP THE NEW CANISTER WITH CYCLES ON CREATION. LEAVE 0 TO ONLY PAY THE BASE CREATION FEE." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                onClick: handleClose,
                disabled: isPending,
                "data-ocid": "create_canister.cancel_button",
                className: "font-mono text-[10px] tracking-[0.2em] uppercase border-border/50 hover:border-border",
                children: "[ESC] CANCEL"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "submit",
                disabled: !canSubmit,
                "data-ocid": "create_canister.submit_button",
                className: "font-mono text-[10px] tracking-[0.2em] uppercase",
                children: isPending ? "PROVISIONING…" : !nameValid ? "[ENTER NAME]" : !canAfford ? "[INSUFFICIENT]" : "[C] CREATE"
              }
            )
          ] })
        ] })
      ]
    }
  ) });
}
function useSavedCycleBalances() {
  const savedRef = reactExports.useRef(/* @__PURE__ */ new Map());
  const updateAndGet = reactExports.useRef(
    (canisterId, incoming) => {
      if (incoming > 0n) {
        savedRef.current.set(canisterId, incoming);
        return incoming;
      }
      const saved = savedRef.current.get(canisterId);
      return saved !== void 0 ? saved : 0n;
    }
  ).current;
  return { updateAndGet };
}
const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];
const BLINK_OFFSETS = [
  0,
  0.37,
  0.74,
  0.13,
  0.51,
  0.88,
  0.26,
  0.63,
  0.19,
  0.56,
  0.93,
  0.31,
  0.68,
  0.07,
  0.44,
  0.81,
  0.22,
  0.59,
  0.96,
  0.33
];
const getBlinkDelay = (index) => BLINK_OFFSETS[index % BLINK_OFFSETS.length];
function AddCanisterModal({ open, onClose }) {
  const [canisterId, setCanisterId] = reactExports.useState("");
  const [customName, setCustomName] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const { mutate, isPending } = useAddCanister();
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = canisterId.trim();
    if (!trimmed) {
      setError("CANISTER ID IS REQUIRED.");
      return;
    }
    const principalRegex = /^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/;
    if (!principalRegex.test(trimmed)) {
      setError("ERR: INVALID FORMAT — EXPECTED: xxxxx-xxxxx-xxxxx-xxxxx-xxxxx");
      return;
    }
    setError("");
    mutate(
      { canisterId: trimmed, customName: customName.trim() },
      {
        onSuccess: () => {
          setCanisterId("");
          setCustomName("");
          onClose();
        }
      }
    );
  };
  const handleClose = () => {
    if (!isPending) {
      setCanisterId("");
      setCustomName("");
      setError("");
      onClose();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && handleClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "sm:max-w-md bg-card border-primary/40 font-mono",
      "data-ocid": "add_canister.dialog",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-base tracking-[0.2em] text-primary uppercase retro-glow-sm", children: ">_ TRACK NEW CANISTER" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "font-mono text-[10px] text-muted-foreground tracking-[0.12em]", children: "PASTE YOUR CANISTER PRINCIPAL ID TO BEGIN MONITORING CYCLE BALANCE AND STATUS." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Label,
              {
                htmlFor: "canister-id",
                className: "font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]",
                children: [
                  "CANISTER ID ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "canister-id",
                placeholder: "xxxxx-xxxxx-xxxxx-xxxxx-xxxxx",
                value: canisterId,
                onChange: (e) => {
                  setCanisterId(e.target.value);
                  if (error) setError("");
                },
                className: "font-mono text-sm bg-background border-primary/30 focus:border-primary",
                "data-ocid": "add_canister.input",
                autoFocus: true
              }
            ),
            error && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: "font-mono text-[10px] text-destructive uppercase tracking-wider",
                "data-ocid": "add_canister.field_error",
                children: error
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Label,
              {
                htmlFor: "canister-name",
                className: "font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]",
                children: [
                  "CUSTOM NAME",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/50 font-normal", children: "(OPT)" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "canister-name",
                placeholder: "e.g. Ledger Service",
                value: customName,
                onChange: (e) => setCustomName(e.target.value),
                className: "font-mono text-sm bg-background border-primary/30 focus:border-primary",
                "data-ocid": "add_canister.name_input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                onClick: handleClose,
                disabled: isPending,
                "data-ocid": "add_canister.cancel_button",
                className: "font-mono text-[10px] tracking-[0.2em] uppercase border-border/50 hover:border-border",
                children: "[ESC] CANCEL"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "submit",
                disabled: isPending,
                "data-ocid": "add_canister.submit_button",
                className: "font-mono text-[10px] tracking-[0.2em] uppercase",
                children: isPending ? "REGISTERING…" : "[ENTER] TRACK"
              }
            )
          ] })
        ] })
      ]
    }
  ) });
}
function DeleteConfirmModal({ canister, onClose }) {
  const { mutate, isPending } = useRemoveCanister();
  const handleConfirm = () => {
    if (!canister) return;
    mutate(canister.canisterId.toString(), { onSuccess: onClose });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Dialog,
    {
      open: !!canister,
      onOpenChange: (v) => !v && !isPending && onClose(),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DialogContent,
        {
          className: "sm:max-w-sm bg-card border-destructive/40 font-mono",
          "data-ocid": "delete_canister.dialog",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-sm tracking-[0.2em] text-destructive uppercase", children: "⚠ REMOVE CANISTER" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { className: "font-mono text-[10px] text-muted-foreground tracking-wider", children: [
                "STOP TRACKING",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium font-mono", children: (canister == null ? void 0 : canister.customName) || `${canister == null ? void 0 : canister.canisterId.toString().slice(0, 12)}…` }),
                "? THIS DOES NOT DELETE THE CANISTER ON-CHAIN."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "gap-2 pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  onClick: onClose,
                  disabled: isPending,
                  "data-ocid": "delete_canister.cancel_button",
                  className: "font-mono text-[10px] tracking-[0.2em] uppercase",
                  children: "[ESC] CANCEL"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "destructive",
                  onClick: handleConfirm,
                  disabled: isPending,
                  "data-ocid": "delete_canister.confirm_button",
                  className: "font-mono text-[10px] tracking-[0.2em] uppercase",
                  children: isPending ? "REMOVING…" : "[DEL] REMOVE"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
function RenameCell({ canister, index }) {
  const [editing, setEditing] = reactExports.useState(false);
  const [value, setValue] = reactExports.useState(canister.customName);
  const inputRef = reactExports.useRef(null);
  const { mutate, isPending } = useRenameCanister();
  reactExports.useEffect(() => {
    var _a;
    if (editing) (_a = inputRef.current) == null ? void 0 : _a.focus();
  }, [editing]);
  const commit = () => {
    const trimmed = value.trim();
    if (trimmed === canister.customName) {
      setEditing(false);
      return;
    }
    mutate(
      { canisterId: canister.canisterId.toString(), newName: trimmed },
      { onSettled: () => setEditing(false) }
    );
  };
  if (editing) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          ref: inputRef,
          value,
          onChange: (e) => setValue(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setValue(canister.customName);
              setEditing(false);
            }
          },
          onBlur: commit,
          className: "h-6 font-mono text-xs px-2 py-0 min-w-0 max-w-[160px] bg-background border-primary/40 focus:border-primary",
          disabled: isPending,
          "data-ocid": `canister.rename_input.${index}`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setValue(canister.customName);
            setEditing(false);
          },
          className: "text-muted-foreground hover:text-foreground transition-colors shrink-0",
          "aria-label": "Cancel rename",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick: () => setEditing(true),
      className: cn(
        "group flex items-center gap-1 text-left min-w-0 w-full",
        "hover:text-primary transition-colors font-mono"
      ),
      "data-ocid": `canister.name.${index}`,
      "aria-label": `Rename ${canister.customName || "unnamed canister"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-mono text-xs text-foreground group-hover:text-primary transition-colors uppercase tracking-[0.08em]", children: canister.customName || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/60 italic", children: "UNNAMED" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" })
      ]
    }
  );
}
function CtrlBadge({ isControlled }) {
  if (isControlled) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: "font-mono text-[9px] font-bold tracking-widest text-accent retro-glow-accent",
        title: "App controller is set — this canister can be managed",
        children: "◆CTRL"
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: "font-mono text-[9px] font-bold tracking-widest text-muted-foreground",
      title: "App controller NOT set — top-ups and controller actions may fail",
      children: "◇NO-CTRL"
    }
  );
}
function SkeletonRow() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-24" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-32" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-14" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-20" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-24" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-6 w-6" }) })
  ] });
}
function CanisterRow({ canister, index, onDelete }) {
  const navigate = useNavigate();
  const handleRowClick = (e) => {
    const target = e.target;
    if (target.closest("button") || target.closest("input") || target.closest("[data-no-navigate]"))
      return;
    navigate({
      to: "/canisters/$canisterId",
      params: { canisterId: canister.canisterId.toString() }
    });
  };
  const handleRowKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleRowClick(e);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "tr",
    {
      className: cn(
        "border-b border-border/20 cursor-pointer group font-mono",
        "hover:bg-primary/5 hover:border-primary/20 transition-colors duration-100"
      ),
      onClick: handleRowClick,
      onKeyDown: handleRowKeyDown,
      "data-ocid": `canister.item.${index}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 min-w-[140px] max-w-[200px]", "data-no-navigate": true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary/30 text-[10px] select-none", children: "├─" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RenameCell, { canister, index })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 whitespace-nowrap", "data-no-navigate": true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          CopyableId,
          {
            id: canister.canisterId.toString(),
            label: "Canister ID",
            startChars: 5,
            endChars: 4,
            "data-ocid": `canister.copy_id.${index}`
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-bold text-primary tabular-nums retro-glow-sm", children: formatCycles(canister.cycleBalance ?? 0n) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            StatusBadge,
            {
              status: canister.status,
              blinkDelay: getBlinkDelay(index - 1)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CtrlBadge, { isControlled: canister.isController })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-muted-foreground", children: canister.lastChecked > 0n ? formatTimestamp(canister.lastChecked) : "—" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-right", "data-no-navigate": true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: (e) => {
              e.stopPropagation();
              onDelete(canister);
            },
            className: cn(
              "inline-flex items-center justify-center h-6 w-6 border border-transparent",
              "text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30",
              "transition-colors duration-100 opacity-0 group-hover:opacity-100"
            ),
            "aria-label": "Remove canister",
            "data-ocid": `canister.delete_button.${index}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" })
          }
        ) })
      ]
    }
  );
}
function CanistersPage() {
  const [page, setPage] = reactExports.useState(1);
  const [search, setSearch] = reactExports.useState("");
  const [showAddModal, setShowAddModal] = reactExports.useState(false);
  const [showCreateModal, setShowCreateModal] = reactExports.useState(false);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(
    null
  );
  const prevSearchRef = reactExports.useRef(search);
  const { updateAndGet: getGuardedBalance } = useSavedCycleBalances();
  const { data, isLoading } = useListCanisters(BigInt(page - 1));
  const isSearchActive = search.trim().length > 0;
  const { data: searchResults, isLoading: isSearchLoading } = useSearchCanisters(search);
  const rawItems = (data == null ? void 0 : data.items) ?? [];
  const total = Number((data == null ? void 0 : data.total) ?? 0n);
  const pageSize = Number((data == null ? void 0 : data.pageSize) ?? 20n);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const items = reactExports.useMemo(
    () => rawItems.map((c) => ({
      ...c,
      cycleBalance: getGuardedBalance(
        c.canisterId.toString(),
        c.cycleBalance
      )
    })),
    [rawItems, getGuardedBalance]
  );
  const guardedSearchResults = reactExports.useMemo(
    () => (searchResults ?? []).map((c) => ({
      ...c,
      cycleBalance: getGuardedBalance(
        c.canisterId.toString(),
        c.cycleBalance
      )
    })),
    [searchResults, getGuardedBalance]
  );
  const filtered = isSearchActive ? guardedSearchResults : items;
  const handleSearchChange = (value) => {
    if (value !== prevSearchRef.current) {
      prevSearchRef.current = value;
      setPage(1);
    }
    setSearch(value);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex flex-col min-h-full font-mono",
      "data-ocid": "canisters.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 pb-3 border-b border-border/40 bg-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[9px] text-primary/40 tracking-widest select-none mb-0.5", children: "┌─[ CANISTER REGISTRY ]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-base font-bold text-primary tracking-[0.2em] uppercase retro-glow", children: ">_ CANISTERS" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-muted-foreground mt-0.5 tracking-[0.12em]", children: isLoading ? "LOADING…" : `${total} CANISTER${total !== 1 ? "S" : ""} TRACKED` })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  onClick: () => setShowAddModal(true),
                  variant: "outline",
                  className: "font-mono text-[10px] tracking-[0.2em] uppercase gap-1.5 shrink-0",
                  "data-ocid": "canisters.add_button",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlus, { className: "h-3.5 w-3.5" }),
                    "[A] TRACK CANISTER"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  onClick: () => setShowCreateModal(true),
                  className: "font-mono text-[10px] tracking-[0.2em] uppercase gap-1.5 shrink-0",
                  "data-ocid": "canisters.create_button",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Terminal, { className: "h-3.5 w-3.5" }),
                    "[C] CREATE CANISTER"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-3 max-w-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "SEARCH BY NAME OR CANISTER ID...",
                value: search,
                onChange: (e) => handleSearchChange(e.target.value),
                className: "pl-8 h-8 font-mono text-xs bg-background border-border/50 focus:border-primary uppercase placeholder:normal-case",
                "data-ocid": "canisters.search_input"
              }
            ),
            search && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => handleSearchChange(""),
                className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                "aria-label": "Clear search",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-x-auto", children: [
          isSearchActive && !isSearchLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-1.5 bg-primary/5 border-b border-primary/20 font-mono text-[10px] text-primary/70 tracking-[0.15em] uppercase", children: [
            (searchResults ?? []).length,
            " RESULT",
            (searchResults ?? []).length !== 1 ? "S" : "",
            " FOR “",
            search.trim(),
            "”"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[640px] text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/40 bg-muted/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]", children: "CANISTER_NAME" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]", children: "CANISTER_ID" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]", children: "CYCLES" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]", children: "STATUS" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]", children: "LAST_CHECKED" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: isSearchActive && isSearchLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "flex items-center justify-center gap-2 py-12 font-mono",
                "data-ocid": "canisters.loading_state",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary retro-glow animate-pulse text-xs tracking-[0.2em] uppercase", children: "[ SEARCHING ALL PAGES... ]" })
              }
            ) }) }) : !isSearchActive && isLoading ? SKELETON_KEYS.map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(SkeletonRow, {}, k)) : filtered.length > 0 ? filtered.map((canister, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              CanisterRow,
              {
                canister,
                index: i + 1,
                onDelete: setDeleteTarget
              },
              canister.canisterId.toString()
            )) : /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, children: isSearchActive ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex flex-col items-center justify-center py-14 text-center gap-3",
                "data-ocid": "canisters.empty_state",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-8 w-8 text-muted-foreground/40" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-xs font-medium text-foreground uppercase tracking-[0.15em]", children: [
                      "NO_RESULTS: “",
                      search,
                      "”"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[10px] text-muted-foreground mt-1", children: [
                      "NO MATCH FOUND ACROSS ALL ",
                      total,
                      " CANISTER",
                      total !== 1 ? "S" : ""
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "outline",
                      size: "sm",
                      onClick: () => handleSearchChange(""),
                      className: "font-mono text-[10px] tracking-[0.2em] uppercase mt-1",
                      children: "CLEAR SEARCH"
                    }
                  )
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex flex-col items-center justify-center py-16 text-center gap-4",
                "data-ocid": "canisters.empty_state",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 border border-primary/30 bg-primary/10 flex items-center justify-center retro-box-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "h-7 w-7 text-primary" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm font-semibold text-foreground uppercase tracking-[0.2em]", children: "NO_CANISTERS_REGISTERED" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-muted-foreground mt-1 max-w-xs tracking-wider", children: "ADD A CANISTER ID TO MONITOR ITS CYCLE BALANCE AND STATUS" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      onClick: () => setShowAddModal(true),
                      className: "font-mono text-[10px] tracking-[0.2em] uppercase gap-1.5 mt-1",
                      "data-ocid": "canisters.empty_add_button",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlus, { className: "h-3.5 w-3.5" }),
                        "TRACK FIRST CANISTER"
                      ]
                    }
                  )
                ]
              }
            ) }) }) })
          ] })
        ] }),
        !isLoading && total > 0 && !isSearchActive && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border/40 px-4 py-2 bg-card/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          PaginationControls,
          {
            page,
            totalPages,
            onPrev: () => setPage((p) => Math.max(1, p - 1)),
            onNext: () => setPage((p) => Math.min(totalPages, p + 1)),
            "data-ocid": "canisters.pagination"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AddCanisterModal,
          {
            open: showAddModal,
            onClose: () => setShowAddModal(false)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CreateCanisterModal,
          {
            open: showCreateModal,
            onClose: () => setShowCreateModal(false)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DeleteConfirmModal,
          {
            canister: deleteTarget,
            onClose: () => setDeleteTarget(null)
          }
        )
      ]
    }
  );
}
export {
  CanistersPage as default
};

import { c as createLucideIcon, s as useParams, r as reactExports, j as jsxRuntimeExports, L as Link, B as Button, C as CopyableId, o as formatCycles, q as formatTimestamp, t as truncatePrincipal, v as Check, X, n as formatIcp } from "./index-BMS8nT-t.js";
import { S as StatusBadge, T as Trash2, P as Pencil } from "./StatusBadge-2KNQNXj9.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-Dxty3jP1.js";
import { h as useGetAppPrincipal, i as useGetCanisterDetails, S as Skeleton, j as useTopUpCanister, k as useGetIcpXdrConversionRate, L as Label, I as Input, l as useRemoveController, m as useGetTransactionHistory, g as useRenameCanister, n as useAddController } from "./index-STxetVaD.js";
import { Z as Zap } from "./zap-Bz0PJ0tH.js";
import { P as Plus } from "./plus-DyCkzdsX.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 16v-4", key: "1dtifu" }],
  ["path", { d: "M12 8h.01", key: "e9boi3" }]
];
const Info = createLucideIcon("info", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
const RefreshCw = createLucideIcon("refresh-cw", __iconNode$2);
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
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ]
];
const Shield = createLucideIcon("shield", __iconNode$1);
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
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const TriangleAlert = createLucideIcon("triangle-alert", __iconNode);
const FALLBACK_CYCLES_PER_ICP = 1e13;
function icpToEstimatedCycles(icpAmount, cyclesPerIcp) {
  return BigInt(Math.floor(icpAmount * cyclesPerIcp));
}
function DetailSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 font-mono", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-48" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border/40 bg-card p-5 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-7 w-56" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-36" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-14 w-full" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border/40 bg-card p-5 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-28" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-full" })
    ] })
  ] });
}
function DetailError({ canisterId }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "canister_detail.error_state",
      className: "flex flex-col items-center justify-center py-20 gap-4 text-center font-mono",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 items-center justify-center border border-destructive/50 bg-destructive/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-6 w-6 text-destructive" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm font-semibold text-foreground uppercase tracking-[0.2em]", children: "ERR: CANISTER_NOT_FOUND" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[10px] text-muted-foreground mt-1 max-w-xs tracking-wider", children: [
            "COULD NOT LOAD DETAILS FOR",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono break-all text-foreground", children: canisterId }),
            ". IT MAY NOT BE TRACKED OR YOU MAY NOT HAVE ACCESS."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/canisters", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "font-mono text-xs tracking-[0.15em] uppercase gap-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
              "BACK TO CANISTERS"
            ]
          }
        ) })
      ]
    }
  );
}
function InlineNameEditor({
  canisterId,
  currentName
}) {
  const [editing, setEditing] = reactExports.useState(false);
  const [value, setValue] = reactExports.useState(currentName);
  const inputRef = reactExports.useRef(null);
  const rename = useRenameCanister();
  reactExports.useEffect(() => {
    var _a;
    if (editing) (_a = inputRef.current) == null ? void 0 : _a.focus();
  }, [editing]);
  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === currentName) {
      setValue(currentName);
      setEditing(false);
      return;
    }
    rename.mutate(
      { canisterId, newName: trimmed },
      { onSettled: () => setEditing(false) }
    );
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setValue(currentName);
      setEditing(false);
    }
  };
  if (editing) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          ref: inputRef,
          "data-ocid": "canister_detail.name_input",
          value,
          onChange: (e) => setValue(e.target.value),
          onKeyDown: handleKeyDown,
          className: "h-8 font-mono text-base font-bold bg-background border-primary/40 focus:border-primary max-w-xs",
          disabled: rename.isPending
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "aria-label": "Save name",
          "data-ocid": "canister_detail.name_save_button",
          onClick: handleSave,
          disabled: rename.isPending,
          className: "flex h-7 w-7 items-center justify-center border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50",
          children: rename.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "aria-label": "Cancel edit",
          "data-ocid": "canister_detail.name_cancel_button",
          onClick: () => {
            setValue(currentName);
            setEditing(false);
          },
          className: "flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border/40 transition-colors",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 group", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-xl font-bold text-foreground leading-tight uppercase tracking-[0.12em] retro-glow-sm", children: currentName || truncatePrincipal(canisterId) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        "aria-label": "Edit canister name",
        "data-ocid": "canister_detail.name_edit_button",
        onClick: () => setEditing(true),
        className: "opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border/40 transition-all",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-2.5 w-2.5" })
      }
    )
  ] });
}
function AddControllerModal({
  open,
  canisterId,
  onClose
}) {
  const [principal, setPrincipal] = reactExports.useState("");
  const addController = useAddController();
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = principal.trim();
    if (!trimmed) return;
    addController.mutate(
      { canisterId, controller: trimmed },
      {
        onSuccess: () => {
          setPrincipal("");
          onClose();
        }
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      "data-ocid": "canister_detail.add_controller_dialog",
      className: "sm:max-w-md font-mono border-primary/40",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-sm tracking-[0.2em] text-primary uppercase retro-glow-sm", children: ">_ ADD CONTROLLER" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Label,
              {
                htmlFor: "controller-principal",
                className: "font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]",
                children: "PRINCIPAL ID"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "controller-principal",
                "data-ocid": "canister_detail.add_controller_input",
                placeholder: "aaaaa-aa...",
                value: principal,
                onChange: (e) => setPrincipal(e.target.value),
                className: "font-mono text-xs bg-background border-primary/30 focus:border-primary",
                autoComplete: "off",
                spellCheck: false
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-muted-foreground tracking-wider", children: "ENTER THE PRINCIPAL ID TO GRANT CONTROLLER ACCESS." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                "data-ocid": "canister_detail.add_controller_cancel_button",
                onClick: onClose,
                className: "font-mono text-[10px] tracking-[0.2em] uppercase",
                children: "[ESC] CANCEL"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "submit",
                "data-ocid": "canister_detail.add_controller_confirm_button",
                disabled: !principal.trim() || addController.isPending,
                className: "font-mono text-[10px] tracking-[0.2em] uppercase",
                children: [
                  addController.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-2" }),
                  "ADD"
                ]
              }
            )
          ] })
        ] })
      ]
    }
  ) });
}
function TopUpSection({
  canisterId,
  currentCycles
}) {
  const [icpInput, setIcpInput] = reactExports.useState("");
  const topUp = useTopUpCanister();
  const { data: liveRate, isLoading: rateLoading } = useGetIcpXdrConversionRate();
  const cyclesPerIcp = liveRate && liveRate > 0n ? Number(liveRate) : FALLBACK_CYCLES_PER_ICP;
  const usingFallbackRate = !rateLoading && (!liveRate || liveRate === 0n);
  const icpAmount = Number.parseFloat(icpInput) || 0;
  const estimatedCycles = icpAmount > 0 ? icpToEstimatedCycles(icpAmount, cyclesPerIcp) : 0n;
  const e8s = BigInt(Math.floor(icpAmount * 1e8));
  const handleTopUp = (e) => {
    e.preventDefault();
    if (!icpAmount || icpAmount <= 0) return;
    topUp.mutate(
      { canisterId, icpAmountE8s: e8s },
      { onSuccess: () => setIcpInput("") }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "terminal-card border border-border/50 bg-card",
      "data-ocid": "canister_detail.topup_section",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border/40 px-4 py-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3.5 w-3.5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-xs font-semibold text-primary uppercase tracking-[0.2em] retro-glow-sm", children: "TOP UP CYCLES" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 border border-primary/30 bg-primary/5 retro-box-glow", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em] mb-1", children: "─── CURRENT BALANCE ───" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-3xl font-bold text-primary tabular-nums retro-glow", children: formatCycles(currentCycles) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-muted-foreground tracking-[0.12em] mt-0.5", children: "CYCLES REMAINING" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleTopUp, className: "space-y-4 font-mono", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Label,
                {
                  htmlFor: "icp-topup",
                  className: "font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]",
                  children: "ICP AMOUNT"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    id: "icp-topup",
                    "data-ocid": "canister_detail.topup_input",
                    type: "number",
                    placeholder: "0.5",
                    min: "0",
                    step: "0.0001",
                    value: icpInput,
                    onChange: (e) => setIcpInput(e.target.value),
                    className: "font-mono pr-12 bg-background border-border/50 focus:border-primary"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs font-medium text-muted-foreground", children: "ICP" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] text-muted-foreground/50 uppercase tracking-wider", children: rateLoading ? "FETCHING LIVE RATE…" : usingFallbackRate ? `RATE: ~${(FALLBACK_CYCLES_PER_ICP / 1e12).toFixed(1)}T CYCLES/ICP (EST)` : `RATE: ${(cyclesPerIcp / 1e12).toFixed(2)}T CYCLES/ICP (LIVE)` })
            ] }),
            estimatedCycles > 0n && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                "data-ocid": "canister_detail.cycles_estimate",
                className: "flex items-center justify-between border border-primary/30 bg-primary/8 px-4 py-2.5",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-muted-foreground uppercase tracking-[0.15em]", children: "EST. CYCLES" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-base font-bold text-primary tabular-nums retro-glow", children: [
                    "+",
                    formatCycles(estimatedCycles)
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "submit",
                "data-ocid": "canister_detail.topup_submit_button",
                className: "w-full font-mono text-xs tracking-[0.15em] uppercase gap-1.5",
                disabled: !icpAmount || icpAmount <= 0 || topUp.isPending,
                children: [
                  topUp.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3.5 w-3.5" }),
                  topUp.isPending ? "PROCESSING…" : "[ENTER] TOP UP CANISTER"
                ]
              }
            )
          ] })
        ] })
      ]
    }
  );
}
function AppControllerBanner({ appPrincipal }) {
  if (!appPrincipal) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-ocid": "canister_detail.app_controller_banner",
      className: "border border-primary/30 bg-primary/5 px-3 py-3 mb-3 font-mono retro-box-glow",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-7 w-7 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-3.5 w-3.5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs font-semibold text-foreground mb-0.5 uppercase tracking-[0.12em]", children: "ADD THIS APP AS A CONTROLLER" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-muted-foreground mb-2 tracking-wider", children: "COPY THE APP CONTROLLER PID BELOW AND ADD IT AS A CONTROLLER SO CANISTERS CAN MANAGE CYCLES ON YOUR BEHALF." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-muted-foreground uppercase tracking-[0.15em]", children: "APP CONTROLLER PID:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              CopyableId,
              {
                id: appPrincipal,
                label: "App Principal",
                startChars: 8,
                endChars: 8,
                "data-ocid": "canister_detail.app_principal_copy",
                className: "font-mono text-xs font-medium text-primary"
              }
            )
          ] })
        ] })
      ] })
    }
  );
}
function ControllersSection({
  canisterId,
  controllers,
  appPrincipal
}) {
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const removeController = useRemoveController();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "terminal-card border border-border/50 bg-card",
      "data-ocid": "canister_detail.controllers_section",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border/40 px-4 py-2 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3.5 w-3.5 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-xs font-semibold text-primary uppercase tracking-[0.2em] retro-glow-sm", children: "CONTROLLERS" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              "data-ocid": "canister_detail.add_controller_open_modal_button",
              onClick: () => setAddOpen(true),
              className: "h-7 font-mono text-[10px] tracking-[0.15em] uppercase gap-1 border-border/50 hover:border-primary/40",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
                "ADD"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AppControllerBanner, { appPrincipal }),
          controllers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              "data-ocid": "canister_detail.controllers_empty_state",
              className: "font-mono text-[10px] text-muted-foreground text-center py-4 uppercase tracking-[0.15em]",
              children: "NO_CONTROLLERS_FOUND"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5", children: controllers.map((ctrl, idx) => {
            const isApp = ctrl === appPrincipal;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "li",
              {
                "data-ocid": `canister_detail.controller_item.${idx + 1}`,
                className: "flex items-center justify-between gap-2 border border-border/40 bg-muted/20 px-3 py-2 hover:border-primary/20 transition-colors duration-100 font-mono",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary/40 text-[10px] select-none shrink-0", children: "├─" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      CopyableId,
                      {
                        id: ctrl,
                        label: "Controller",
                        startChars: 6,
                        endChars: 6,
                        "data-ocid": `canister_detail.controller_copy.${idx + 1}`
                      }
                    ),
                    isApp && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 font-mono text-[10px] px-1.5 py-0 border border-primary/30 bg-primary/10 text-primary uppercase tracking-[0.15em]", children: "[THIS APP]" })
                  ] }),
                  !isApp && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      "aria-label": `Remove controller ${truncatePrincipal(ctrl)}`,
                      "data-ocid": `canister_detail.remove_controller_button.${idx + 1}`,
                      disabled: removeController.isPending,
                      onClick: () => removeController.mutate({
                        canisterId,
                        controller: ctrl
                      }),
                      className: "shrink-0 flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/30 transition-colors disabled:opacity-50",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" })
                    }
                  )
                ]
              },
              ctrl
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          AddControllerModal,
          {
            open: addOpen,
            canisterId,
            onClose: () => setAddOpen(false)
          }
        )
      ]
    }
  );
}
function TxRow({ tx, index }) {
  const isTopUp = tx.kind.__kind__ === "topUp";
  const cyclesAdded = isTopUp && tx.kind.__kind__ === "topUp" ? tx.kind.topUp.cyclesAdded : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": `canister_detail.tx_item.${index}`,
      className: "flex items-start justify-between gap-4 border border-border/30 bg-muted/10 px-3 py-2.5 font-mono hover:border-primary/20 transition-colors duration-100",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary/40 text-[10px] select-none shrink-0", children: "└─" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-7 w-7 shrink-0 items-center justify-center border border-primary/30 bg-primary/8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3.5 w-3.5 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs font-medium text-foreground uppercase tracking-[0.1em]", children: "TOP_UP" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-muted-foreground", children: formatTimestamp(tx.timestamp) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-xs font-semibold text-foreground tabular-nums", children: [
            formatIcp(tx.amountE8s),
            " ICP"
          ] }),
          cyclesAdded !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[10px] text-primary tabular-nums retro-glow-sm", children: [
            "+",
            formatCycles(cyclesAdded),
            " CYCLES"
          ] })
        ] })
      ]
    }
  );
}
function TransactionHistorySection({ canisterId }) {
  const [page, setPage] = reactExports.useState(0n);
  const { data, isLoading } = useGetTransactionHistory(page);
  const filtered = reactExports.useMemo(() => {
    if (!(data == null ? void 0 : data.items)) return [];
    return data.items.filter(
      (tx) => tx.kind.__kind__ === "topUp" && tx.kind.topUp.canisterId.toText() === canisterId
    );
  }, [data, canisterId]);
  const totalPages = data ? Math.ceil(Number(data.total) / Number(data.pageSize)) : 0;
  const currentPage = data ? Number(data.page) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "terminal-card border border-border/50 bg-card",
      "data-ocid": "canister_detail.tx_section",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border/40 px-4 py-2 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-xs font-semibold text-primary uppercase tracking-[0.2em] retro-glow-sm", children: "TRANSACTION HISTORY" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-2", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            "data-ocid": "canister_detail.tx_loading_state",
            className: "space-y-1.5",
            children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, i))
          }
        ) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": "canister_detail.tx_empty_state",
            className: "flex flex-col items-center py-8 gap-2 text-center",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-7 w-7 text-muted-foreground/40" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-muted-foreground uppercase tracking-[0.15em]", children: "NO_TOPUP_TRANSACTIONS_FOUND" })
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          filtered.map((tx, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(TxRow, { tx, index: idx + 1 }, tx.id.toString())),
          totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-2 border-t border-border/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[10px] text-muted-foreground tracking-wider", children: [
              "PAGE ",
              currentPage + 1,
              " / ",
              totalPages
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  "data-ocid": "canister_detail.tx_pagination_prev",
                  disabled: page === 0n,
                  onClick: () => setPage((p) => p > 0n ? p - 1n : 0n),
                  className: "h-6 font-mono text-[10px] tracking-[0.15em] uppercase",
                  children: "[PREV]"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  "data-ocid": "canister_detail.tx_pagination_next",
                  disabled: currentPage + 1 >= totalPages,
                  onClick: () => setPage((p) => p + 1n),
                  className: "h-6 font-mono text-[10px] tracking-[0.15em] uppercase",
                  children: "[NEXT]"
                }
              )
            ] })
          ] })
        ] }) })
      ]
    }
  );
}
function HeroStats({ details }) {
  const canisterId = details.canisterId.toText();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "terminal-card border border-primary/30 bg-card overflow-hidden retro-box-glow",
      "data-ocid": "canister_detail.overview_card",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-0.5 bg-primary retro-glow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start gap-3 mb-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                InlineNameEditor,
                {
                  canisterId,
                  currentName: details.customName
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                CopyableId,
                {
                  id: canisterId,
                  label: "Canister ID",
                  startChars: 8,
                  endChars: 8,
                  "data-ocid": "canister_detail.canister_id_copy",
                  className: "font-mono text-xs"
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: details.status, className: "shrink-0 mt-1" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-primary/30 bg-primary/5 px-5 py-4 mb-4 retro-box-glow", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground mb-1", children: "─── CYCLE BALANCE ───" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                "data-ocid": "canister_detail.cycle_balance",
                className: "font-mono text-5xl font-bold text-primary tabular-nums leading-tight retro-glow",
                children: formatCycles(details.cycleBalance)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-muted-foreground mt-1 uppercase tracking-[0.12em]", children: "CYCLES REMAINING" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border/40 bg-muted/20 px-3 py-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em] mb-0.5", children: "LAST_CHECKED" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs text-foreground truncate", children: formatTimestamp(details.lastChecked) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border/40 bg-muted/20 px-3 py-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em] mb-0.5", children: "CREATED" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs text-foreground truncate", children: formatTimestamp(details.createdAt) })
            ] })
          ] })
        ] })
      ]
    }
  );
}
function CanisterDetail() {
  const { canisterId } = useParams({ strict: false });
  const { data: appPrincipal = "" } = useGetAppPrincipal();
  const {
    data: details,
    isLoading,
    isError
  } = useGetCanisterDetails(canisterId);
  const controllers = reactExports.useMemo(
    () => ((details == null ? void 0 : details.controllers) ?? []).map((c) => c.toText()),
    [details]
  );
  if (!canisterId) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-4 py-5 space-y-4 font-mono", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: "/canisters",
        "data-ocid": "canister_detail.back_link",
        className: "inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors group uppercase tracking-[0.12em]",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" }),
          "[←] BACK TO CANISTERS"
        ]
      }
    ),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "canister_detail.loading_state", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DetailSkeleton, {}) }) : isError || !details ? /* @__PURE__ */ jsxRuntimeExports.jsx(DetailError, { canisterId }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(HeroStats, { details }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TopUpSection,
        {
          canisterId,
          currentCycles: details.cycleBalance ?? 0n
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ControllersSection,
        {
          canisterId,
          controllers,
          appPrincipal
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TransactionHistorySection, { canisterId })
    ] })
  ] });
}
export {
  CanisterDetail as default
};

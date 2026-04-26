import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, E as formatIcp, B as Button, M as useInternetIdentity, N as Server, w as formatCycles, W as Wallet, L as Link, C as CopyableId } from "./index-BpKfS_dG.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, S as StatusBadge } from "./dialog-CBVsfKDh.js";
import { v as useGetMyBalance, w as useTransferIcp, L as Label, I as Input, h as useGetAppPrincipal, d as useListCanisters, t as useGetMyAccount, S as Skeleton, j as useAddCanister } from "./index-DXMaWJol.js";
import { P as Plus } from "./plus-D9BHPCE0.js";
import { A as ArrowUpRight } from "./arrow-up-right-BHbqFo_-.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
];
const ArrowRight = createLucideIcon("arrow-right", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "M11 9h4a2 2 0 0 0 2-2V3", key: "1ve2rv" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
  ["path", { d: "M7 21v-4a2 2 0 0 1 2-2h4", key: "1fwkro" }],
  ["circle", { cx: "15", cy: "15", r: "2", key: "3i40o0" }]
];
const CircuitBoard = createLucideIcon("circuit-board", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["circle", { cx: "8", cy: "8", r: "6", key: "3yglwk" }],
  ["path", { d: "M18.09 10.37A6 6 0 1 1 10.34 18", key: "t5s6rm" }],
  ["path", { d: "M7 6h1v4", key: "1obek4" }],
  ["path", { d: "m16.71 13.88.7.71-2.82 2.82", key: "1rbuyh" }]
];
const Coins = createLucideIcon("coins", __iconNode$2);
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
      d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
      key: "1ffxy3"
    }
  ],
  ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]
];
const Send = createLucideIcon("send", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M16 7h6v6", key: "box55l" }],
  ["path", { d: "m22 7-8.5 8.5-5-5L2 17", key: "1t1m79" }]
];
const TrendingUp = createLucideIcon("trending-up", __iconNode);
function SendIcpModal({ open, onClose }) {
  const [toAccountId, setToAccountId] = reactExports.useState("");
  const [amount, setAmount] = reactExports.useState("");
  const [memo, setMemo] = reactExports.useState("");
  const { data: balance } = useGetMyBalance();
  const { mutate: transfer, isPending } = useTransferIcp();
  const handleSubmit = (e) => {
    e.preventDefault();
    const amountNum = Number.parseFloat(amount);
    if (!toAccountId.trim() || Number.isNaN(amountNum) || amountNum <= 0)
      return;
    const amountE8s = BigInt(Math.round(amountNum * 1e8));
    transfer(
      { toAccountId: toAccountId.trim(), amountE8s, memo: memo.trim() },
      {
        onSuccess: () => {
          setToAccountId("");
          setAmount("");
          setMemo("");
          onClose();
        }
      }
    );
  };
  const handleClose = () => {
    if (!isPending) {
      setToAccountId("");
      setAmount("");
      setMemo("");
      onClose();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => !o && handleClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "sm:max-w-md bg-card border-primary/40 font-mono",
      "data-ocid": "send_icp.dialog",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "font-mono text-base tracking-[0.2em] text-primary uppercase flex items-center gap-2 retro-glow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3.5 w-3.5" }),
          ">_ SEND ICP"
        ] }) }),
        balance !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-3 py-2 border border-border/40 bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-muted-foreground uppercase tracking-[0.15em]", children: "AVAILABLE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-sm font-semibold text-primary tabular-nums retro-glow-sm", children: [
            formatIcp(balance),
            " ICP"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Label,
              {
                htmlFor: "to-account-id",
                className: "font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]",
                children: "DESTINATION ACCOUNT ID"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "to-account-id",
                placeholder: "64-character hex account ID",
                value: toAccountId,
                onChange: (e) => setToAccountId(e.target.value),
                className: "font-mono text-xs bg-background border-primary/30 focus:border-primary",
                autoComplete: "off",
                spellCheck: false,
                "data-ocid": "send_icp.account_id_input",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Label,
              {
                htmlFor: "icp-amount",
                className: "font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]",
                children: "AMOUNT (ICP)"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "icp-amount",
                type: "number",
                step: "0.00000001",
                min: "0.00000001",
                placeholder: "0.00",
                value: amount,
                onChange: (e) => setAmount(e.target.value),
                className: "font-mono text-sm bg-background border-primary/30 focus:border-primary",
                "data-ocid": "send_icp.amount_input",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Label,
              {
                htmlFor: "memo",
                className: "font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]",
                children: [
                  "MEMO ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/50", children: "(OPT)" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "memo",
                placeholder: "e.g. Payment for services",
                value: memo,
                onChange: (e) => setMemo(e.target.value),
                className: "font-mono text-sm bg-background border-primary/30 focus:border-primary",
                "data-ocid": "send_icp.memo_input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-3 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "ghost",
                onClick: handleClose,
                disabled: isPending,
                "data-ocid": "send_icp.cancel_button",
                className: "font-mono text-[10px] tracking-[0.2em] uppercase border border-border/40 hover:border-border",
                children: "[ESC] CANCEL"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "submit",
                disabled: isPending || !toAccountId.trim() || !amount,
                "data-ocid": "send_icp.submit_button",
                className: "font-mono text-[10px] tracking-[0.2em] uppercase gap-1.5",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3 w-3" }),
                  isPending ? "TRANSMITTING…" : "[ENTER] SEND ICP"
                ]
              }
            )
          ] })
        ] })
      ]
    }
  ) });
}
function StatCard({
  label,
  value,
  icon: Icon,
  accent = "text-primary",
  loading,
  "data-ocid": dataOcid
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-ocid": dataOcid,
      className: "terminal-card terminal-card-full bg-card hover:border-primary/60 transition-colors duration-150 p-4",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em] mb-2", children: [
            "─── ",
            label,
            " ───"
          ] }),
          loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-28" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              className: `font-mono text-2xl font-bold tabular-nums tracking-tight retro-glow ${accent}`,
              children: value
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 retro-box-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 text-primary" }) })
      ] })
    }
  );
}
function AddCanisterModal({
  open,
  onClose
}) {
  const [canisterId, setCanisterId] = reactExports.useState("");
  const [customName, setCustomName] = reactExports.useState("");
  const { mutate: addCanister, isPending } = useAddCanister();
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canisterId.trim()) return;
    addCanister(
      { canisterId: canisterId.trim(), customName: customName.trim() },
      {
        onSuccess: () => {
          setCanisterId("");
          setCustomName("");
          onClose();
        }
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "sm:max-w-md bg-card border-primary/40 font-mono",
      "data-ocid": "add_canister.dialog",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-mono text-base tracking-[0.2em] text-primary uppercase retro-glow-sm", children: "> ADD CANISTER" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Label,
              {
                htmlFor: "canister-id",
                className: "font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]",
                children: "CANISTER ID"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "canister-id",
                placeholder: "e.g. rrkah-fqaaa-aaaaa-aaaaq-cai",
                value: canisterId,
                onChange: (e) => setCanisterId(e.target.value),
                className: "font-mono text-sm bg-background border-primary/30 focus:border-primary",
                autoComplete: "off",
                spellCheck: false,
                "data-ocid": "add_canister.input",
                required: true
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
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/50", children: "(OPTIONAL)" })
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
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-3 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "ghost",
                onClick: onClose,
                "data-ocid": "add_canister.cancel_button",
                className: "font-mono text-[10px] tracking-[0.2em] border border-border/50 hover:border-border uppercase",
                children: "[ESC] CANCEL"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "submit",
                disabled: isPending || !canisterId.trim(),
                "data-ocid": "add_canister.submit_button",
                className: "font-mono text-[10px] tracking-[0.2em] uppercase",
                children: isPending ? "ADDING…" : "[ENTER] ADD"
              }
            )
          ] })
        ] })
      ]
    }
  ) });
}
function RecentCanisterRow({
  name,
  canisterId,
  cycles,
  status,
  index
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: "/canisters/$canisterId",
      params: { canisterId },
      "data-ocid": `recent_canisters.item.${index}`,
      className: "group flex items-center gap-4 px-3 py-2.5 hover:bg-primary/8 transition-colors duration-100 border-b border-border/20 last:border-b-0 font-mono",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary/40 text-[10px] shrink-0 select-none", children: "├─" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-7 w-7 shrink-0 items-center justify-center border border-primary/30 bg-primary/8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircuitBoard, { className: "h-3 w-3 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-mono text-foreground truncate group-hover:text-primary transition-colors tracking-[0.1em] uppercase", children: name || "UNNAMED_CANISTER" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-muted-foreground mt-0.5 truncate tracking-wide", children: canisterId.length > 30 ? `${canisterId.slice(0, 14)}...${canisterId.slice(-8)}` : canisterId })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden sm:flex items-center gap-3 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-bold text-primary tabular-nums retro-glow-sm", children: formatCycles(cycles) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" })
      ]
    }
  );
}
function IdentityCard({
  label,
  id,
  description,
  ocid,
  startChars = 6,
  endChars = 6,
  loading
}) {
  if (loading || !id) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5 border border-border/40 p-3 terminal-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-full" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5 border border-border/40 p-3 hover:border-primary/40 transition-colors duration-150 terminal-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]", children: [
        "> ",
        label
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] px-1.5 py-0 border border-border/40 text-muted-foreground/70 uppercase tracking-[0.1em]", children: description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CopyableId,
      {
        id,
        label,
        startChars,
        endChars,
        "data-ocid": ocid,
        className: "w-full justify-between"
      }
    )
  ] });
}
function Dashboard() {
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [sendOpen, setSendOpen] = reactExports.useState(false);
  const { identity } = useInternetIdentity();
  const userPid = (identity == null ? void 0 : identity.getPrincipal().toText()) ?? "";
  const { data: appCanisterPid = "" } = useGetAppPrincipal();
  const { data: canistersPage, isLoading: canistersLoading } = useListCanisters(0n);
  const { data: account, isLoading: accountLoading } = useGetMyAccount();
  const { data: balance, isLoading: balanceLoading } = useGetMyBalance();
  const canisters = (canistersPage == null ? void 0 : canistersPage.items) ?? [];
  const totalCanisters = (canistersPage == null ? void 0 : canistersPage.total) ?? 0n;
  const totalCycles = canisters.reduce(
    (sum, c) => sum + (c.cycleBalance ?? 0n),
    0n
  );
  const recentCanisters = canisters.slice(0, 5);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-5 p-4 lg:p-6 max-w-6xl mx-auto font-mono", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "terminal-card terminal-card-full bg-card px-4 py-3 border border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[9px] text-primary/50 tracking-widest select-none mb-0.5", children: "┌─[ SYSTEM OVERVIEW ]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-base font-bold text-primary tracking-[0.2em] uppercase retro-glow", children: ">_ DASHBOARD" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-muted-foreground mt-0.5 tracking-[0.12em]", children: "CANISTERS & ACCOUNT STATUS" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => setSendOpen(true),
            "data-ocid": "dashboard.send_icp_button",
            className: "font-mono text-[10px] tracking-[0.15em] border-primary/30 hover:border-primary/60 hover:text-primary uppercase gap-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3 w-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "[S] SEND ICP" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            onClick: () => setAddOpen(true),
            "data-ocid": "dashboard.add_canister_button",
            className: "font-mono text-[10px] tracking-[0.15em] uppercase gap-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
              "[A] ADD"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "dashboard.stats_section",
        className: "grid grid-cols-2 xl:grid-cols-4 gap-3",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            StatCard,
            {
              label: "Total Canisters",
              value: totalCanisters.toString(),
              icon: Server,
              accent: "text-foreground",
              loading: canistersLoading,
              "data-ocid": "dashboard.stat.total_canisters"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            StatCard,
            {
              label: "Total Cycles",
              value: formatCycles(totalCycles),
              icon: TrendingUp,
              accent: "text-primary",
              loading: canistersLoading,
              "data-ocid": "dashboard.stat.total_cycles"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            StatCard,
            {
              label: "ICP Balance",
              value: balance !== void 0 ? `${formatIcp(balance)} ICP` : "—",
              icon: Coins,
              accent: "text-accent",
              loading: balanceLoading,
              "data-ocid": "dashboard.stat.icp_balance"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            StatCard,
            {
              label: "Account",
              value: (account == null ? void 0 : account.accountId) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-sm truncate block", children: [
                account.accountId.slice(0, 8),
                "…"
              ] }) : "—",
              icon: Wallet,
              accent: "text-foreground",
              loading: accountLoading,
              "data-ocid": "dashboard.stat.account"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "terminal-card terminal-card-full border border-border/60 bg-card",
        "data-ocid": "dashboard.identity_section",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border/40 px-4 py-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircuitBoard, { className: "h-3.5 w-3.5 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-xs font-semibold text-primary uppercase tracking-[0.2em] retro-glow-sm", children: "IDENTITY & ADDRESSES" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto font-mono text-[9px] text-primary/40 select-none tracking-widest", children: "──────────" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-0 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              IdentityCard,
              {
                label: "Your Principal ID",
                id: userPid,
                description: "Your identity",
                ocid: "dashboard.user_pid_copy",
                startChars: 8,
                endChars: 6,
                loading: !userPid
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              IdentityCard,
              {
                label: "App Controller PID",
                id: appCanisterPid,
                description: "Add as controller",
                ocid: "dashboard.app_pid_copy",
                startChars: 8,
                endChars: 6,
                loading: !appCanisterPid
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              IdentityCard,
              {
                label: "Your ICP Account ID",
                id: (account == null ? void 0 : account.accountId) ?? "",
                description: "Send ICP here",
                ocid: "dashboard.account_id_copy",
                startChars: 10,
                endChars: 8,
                loading: accountLoading || !(account == null ? void 0 : account.accountId)
              }
            ) })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "terminal-card terminal-card-full border border-border/60 bg-card",
        "data-ocid": "dashboard.recent_canisters_section",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border/40 px-4 py-2 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Server, { className: "h-3.5 w-3.5 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-xs font-semibold text-primary uppercase tracking-[0.2em] retro-glow-sm", children: "RECENT CANISTERS" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/canisters",
                "data-ocid": "dashboard.view_all_canisters_link",
                className: "flex items-center gap-1 font-mono text-[10px] text-primary hover:text-primary/70 transition-colors uppercase tracking-[0.12em]",
                children: [
                  "VIEW ALL",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3 w-3" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-1", children: canistersLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "space-y-1 py-1",
              "data-ocid": "recent_canisters.loading_state",
              children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 px-3 py-2.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-7 w-7 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-40" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-2.5 w-56" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-20 hidden sm:block" })
              ] }, i))
            }
          ) : recentCanisters.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": "recent_canisters.empty_state",
              className: "flex flex-col items-center justify-center gap-3 py-10 text-center",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-12 items-center justify-center border border-border/50 bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Server, { className: "h-5 w-5 text-muted-foreground" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs font-medium text-foreground uppercase tracking-[0.15em]", children: "NO_CANISTERS_FOUND" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-muted-foreground mt-1 tracking-wider", children: "ADD YOUR FIRST CANISTER TO START TRACKING CYCLES" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    onClick: () => setAddOpen(true),
                    "data-ocid": "recent_canisters.add_first_button",
                    className: "font-mono text-[10px] tracking-[0.15em] uppercase gap-1.5",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
                      "ADD CANISTER"
                    ]
                  }
                )
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0", "data-ocid": "recent_canisters.list", children: recentCanisters.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            RecentCanisterRow,
            {
              name: c.customName,
              canisterId: c.canisterId.toText(),
              cycles: c.cycleBalance ?? 0n,
              status: c.status,
              index: i + 1
            },
            c.canisterId.toText()
          )) }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AddCanisterModal, { open: addOpen, onClose: () => setAddOpen(false) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SendIcpModal, { open: sendOpen, onClose: () => setSendOpen(false) })
  ] });
}
export {
  Dashboard as default
};

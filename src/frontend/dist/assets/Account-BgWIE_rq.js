import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, W as Wallet, n as formatIcp, C as CopyableId, w as truncateAccountId, B as Button, x as TooltipProvider, m as cn, y as Tooltip, z as TooltipTrigger, A as formatRelativeTime, E as TooltipContent, q as formatTimestamp } from "./index-BMS8nT-t.js";
import { P as PaginationControls } from "./PaginationControls-DyF9oby2.js";
import { o as useGetMyAccount, a as useGetMyBalance, m as useGetTransactionHistory, S as Skeleton, p as useTransferIcp, L as Label, I as Input } from "./index-STxetVaD.js";
import { A as ArrowUpRight } from "./arrow-up-right-B3q-74Sw.js";
import { Z as Zap } from "./zap-Bz0PJ0tH.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const CircleCheck = createLucideIcon("circle-check", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]
];
const Clock = createLucideIcon("clock", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
];
const FileText = createLucideIcon("file-text", __iconNode$2);
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
      d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
      key: "zw3jo"
    }
  ],
  [
    "path",
    {
      d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
      key: "1wduqc"
    }
  ],
  [
    "path",
    {
      d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
      key: "kqbvx6"
    }
  ]
];
const Layers = createLucideIcon("layers", __iconNode$1);
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
      d: "M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z",
      key: "117uat"
    }
  ],
  ["path", { d: "M6 12h16", key: "s4cdu5" }]
];
const SendHorizontal = createLucideIcon("send-horizontal", __iconNode);
const DEFAULT_FORM = { recipient: "", amount: "", memo: "" };
function SendIcpForm({
  balance,
  onSuccess
}) {
  const [form, setForm] = reactExports.useState(DEFAULT_FORM);
  const [sent, setSent] = reactExports.useState(false);
  const [lastAmount, setLastAmount] = reactExports.useState(0n);
  const [lastRecipient, setLastRecipient] = reactExports.useState("");
  const transferMutation = useTransferIcp();
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const amountE8s = form.amount ? BigInt(Math.round(Number.parseFloat(form.amount) * 1e8)) : 0n;
  const isValid = form.recipient.trim().length > 0 && amountE8s > 0n && amountE8s <= balance;
  const handleSend = async () => {
    if (!isValid) return;
    try {
      setLastAmount(amountE8s);
      setLastRecipient(form.recipient.trim());
      await transferMutation.mutateAsync({
        toAccountId: form.recipient.trim(),
        amountE8s,
        memo: form.memo.trim()
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setForm(DEFAULT_FORM);
        onSuccess();
      }, 2500);
    } catch {
    }
  };
  if (sent) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "transfer.success_state",
        className: "flex flex-col items-center justify-center gap-3 py-10 text-center border border-accent/30 bg-accent/5",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-10 w-10 text-accent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm font-semibold text-foreground uppercase tracking-[0.15em]", children: "TRANSFER_SENT" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-xs text-muted-foreground", children: [
            formatIcp(lastAmount),
            " ICP → ",
            truncateAccountId(lastRecipient, 8, 8)
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 font-mono", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Label,
        {
          htmlFor: "recipient",
          className: "font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]",
          children: "RECIPIENT ACCOUNT ID"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "recipient",
          "data-ocid": "transfer.recipient.input",
          placeholder: "64-character hex account ID",
          value: form.recipient,
          onChange: set("recipient"),
          className: "font-mono text-xs h-9 bg-background border-border/60 focus:border-primary"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Label,
          {
            htmlFor: "amount",
            className: "font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]",
            children: "AMOUNT (ICP)"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "amount",
            "data-ocid": "transfer.amount.input",
            type: "number",
            placeholder: "0.00",
            min: "0",
            step: "0.00000001",
            value: form.amount,
            onChange: set("amount"),
            className: "font-mono h-9 bg-background border-border/60 focus:border-primary"
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
            "data-ocid": "transfer.memo.input",
            placeholder: "Reference note",
            value: form.memo,
            onChange: set("memo"),
            className: "font-mono h-9 bg-background border-border/60 focus:border-primary"
          }
        )
      ] })
    ] }),
    form.amount && amountE8s > balance && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "p",
      {
        "data-ocid": "transfer.field_error",
        className: "font-mono text-xs text-destructive bg-destructive/10 border border-destructive/40 px-3 py-1.5 uppercase tracking-[0.12em]",
        children: [
          "ERR: INSUFFICIENT BALANCE — AVAILABLE: ",
          formatIcp(balance),
          " ICP"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        "data-ocid": "transfer.submit_button",
        className: "w-full h-9 gap-2 font-mono text-xs tracking-[0.15em] uppercase",
        disabled: !isValid || transferMutation.isPending,
        onClick: handleSend,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SendHorizontal, { className: "h-3.5 w-3.5" }),
          transferMutation.isPending ? "TRANSMITTING…" : "[ENTER] SEND ICP"
        ]
      }
    )
  ] });
}
function TxRow({ tx, index }) {
  const isTopUp = tx.kind.__kind__ === "topUp";
  const targetLabel = tx.kind.__kind__ === "topUp" ? tx.kind.topUp.canisterId.toText() : tx.kind.icpTransfer.toAccountId;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { delayDuration: 300, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": `transactions.item.${index + 1}`,
      className: cn(
        "flex items-center gap-3 px-3 py-2.5 border border-border/40 bg-card/60 font-mono",
        "hover:bg-card hover:border-primary/20 transition-colors duration-150"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary/30 text-[10px] select-none shrink-0", children: "├─" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: cn(
              "flex items-center justify-center h-7 w-7 border shrink-0",
              isTopUp ? "border-accent/40 bg-accent/10 text-accent" : "border-primary/40 bg-primary/10 text-primary"
            ),
            children: isTopUp ? /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3 w-3" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-medium text-foreground uppercase tracking-[0.1em]", children: isTopUp ? "CYCLE_TOPUP" : "ICP_TRANSFER" }),
            tx.memo && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-muted-foreground/60 truncate max-w-[140px]", children: tx.memo })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[10px] text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isTopUp ? "→CANISTER:" : "→ACCOUNT:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono opacity-70 truncate max-w-[120px]", children: truncateAccountId(targetLabel, 6, 6) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0 space-y-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: cn(
                "font-mono text-xs font-semibold tabular-nums",
                isTopUp ? "text-accent" : "text-primary"
              ),
              children: [
                isTopUp ? "+" : "−",
                formatIcp(tx.amountE8s),
                " ICP"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1 font-mono text-[10px] text-muted-foreground cursor-default", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-2.5 w-2.5" }),
              formatRelativeTime(tx.timestamp)
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { side: "left", className: "font-mono text-xs", children: formatTimestamp(tx.timestamp) })
          ] })
        ] })
      ]
    }
  ) });
}
function TxSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-3 py-2.5 border border-border/30 bg-card/60", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-7 w-7 shrink-0" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-32" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-2.5 w-48" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-20 ml-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-2.5 w-16 ml-auto" })
    ] })
  ] });
}
function Account() {
  const [txPage, setTxPage] = reactExports.useState(0n);
  const pageNum = Number(txPage) + 1;
  const { data: account, isLoading: accountLoading } = useGetMyAccount();
  const {
    data: balanceRaw,
    isLoading: balanceLoading,
    refetch: refetchBalance
  } = useGetMyBalance();
  const { data: txData, isLoading: txLoading } = useGetTransactionHistory(txPage);
  const balance = balanceRaw ?? 0n;
  const transactions = (txData == null ? void 0 : txData.items) ?? [];
  const totalTxPages = txData ? Math.max(1, Math.ceil(Number(txData.total) / 20)) : 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "account.page",
      className: "max-w-4xl mx-auto space-y-4 px-4 py-6 font-mono",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "terminal-card border border-border/50 bg-card px-4 py-3 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 border border-primary/40 bg-primary/10 flex items-center justify-center retro-box-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[9px] text-primary/40 tracking-widest select-none mb-0.5", children: "┌─[ ACCOUNT TERMINAL ]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-mono text-base font-bold text-primary tracking-[0.2em] uppercase retro-glow", children: ">_ MY ACCOUNT" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-muted-foreground tracking-[0.12em]", children: "MANAGE ICP BALANCE & TRANSFERS" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": "account.balance.card",
              className: "terminal-card border border-border/50 bg-card hover:border-primary/30 transition-colors duration-150",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border/30 px-3 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]", children: "─── ICP BALANCE ───" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3", children: [
                  balanceLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-36" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-4xl font-bold text-primary tabular-nums retro-glow", children: formatIcp(balance) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-base text-muted-foreground mb-1 tracking-[0.1em]", children: "ICP" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-muted-foreground mt-1.5 tracking-wider", children: "AVAILABLE TO SEND OR TOP-UP CANISTERS" })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              "data-ocid": "account.id.card",
              className: "terminal-card border border-border/50 bg-card hover:border-primary/30 transition-colors duration-150",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border/30 px-3 py-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]", children: "─── ACCOUNT ID ───" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 space-y-2", children: accountLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-full" }) : account ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    CopyableId,
                    {
                      "data-ocid": "account.account_id.copy",
                      id: account.accountId,
                      label: "Account ID",
                      startChars: 8,
                      endChars: 8,
                      className: "w-full justify-between px-3 py-2 font-mono text-xs"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-muted-foreground tracking-wider", children: "SEND ICP TO THIS ADDRESS FROM ANY WALLET" })
                ] }) : null })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": "transfer.card",
            className: "terminal-card border border-border/50 bg-card",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border/40 px-4 py-2 flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3.5 w-3.5 text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-xs font-semibold text-primary uppercase tracking-[0.2em] retro-glow-sm", children: "SEND ICP" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                SendIcpForm,
                {
                  balance,
                  onSuccess: () => {
                    refetchBalance();
                  }
                }
              ) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": "transactions.card",
            className: "terminal-card border border-border/50 bg-card",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border/40 px-4 py-2 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-mono text-xs font-semibold text-primary uppercase tracking-[0.2em] retro-glow-sm", children: "TRANSACTION HISTORY" })
                ] }),
                txData && txData.total > 0n && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: "font-mono text-[10px] px-1.5 py-0.5 border border-border/50 text-muted-foreground uppercase tracking-[0.15em]",
                    "data-ocid": "transactions.total.badge",
                    children: [
                      txData.total.toString(),
                      " TOTAL"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 space-y-1.5", children: txLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TxSkeleton, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TxSkeleton, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TxSkeleton, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "transactions.loading_state", className: "sr-only", children: "Loading transactions…" })
              ] }) : transactions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  "data-ocid": "transactions.empty_state",
                  className: "flex flex-col items-center justify-center gap-3 py-12 text-center",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 border border-border/40 bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-5 w-5 text-muted-foreground/50" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs font-medium text-foreground uppercase tracking-[0.15em]", children: "NO_TRANSACTIONS_FOUND" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-[10px] text-muted-foreground mt-1 max-w-[260px]", children: "TRANSACTIONS APPEAR HERE AFTER TOPPING UP CANISTERS OR SENDING ICP" })
                    ] })
                  ]
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: transactions.map((tx, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(TxRow, { tx, index: i }, tx.id.toString())) }),
                totalTxPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 border-t border-border/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  PaginationControls,
                  {
                    "data-ocid": "transactions.pagination",
                    page: pageNum,
                    totalPages: totalTxPages,
                    onPrev: () => setTxPage((p) => p > 0n ? p - 1n : 0n),
                    onNext: () => setTxPage((p) => p + 1n)
                  }
                ) })
              ] }) })
            ]
          }
        )
      ]
    }
  );
}
export {
  Account as default
};

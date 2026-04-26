import type { Transaction } from "@/backend.d";
import { CopyableId } from "@/components/CopyableId";
import { PaginationControls } from "@/components/PaginationControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useGetMyAccount,
  useGetMyBalance,
  useGetTransactionHistory,
} from "@/hooks/useBackend";
import { useTransferIcp } from "@/hooks/useCanisterMutations";
import {
  formatIcp,
  formatRelativeTime,
  formatTimestamp,
  truncateAccountId,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  SendHorizonal,
  Wallet,
  Zap,
} from "lucide-react";
import { useState } from "react";

// ─── Transfer Form ─────────────────────────────────────────────────────────

interface TransferState {
  recipient: string;
  amount: string;
  memo: string;
}

const DEFAULT_FORM: TransferState = { recipient: "", amount: "", memo: "" };

function SendIcpForm({
  balance,
  onSuccess,
}: {
  balance: bigint;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<TransferState>(DEFAULT_FORM);
  const [sent, setSent] = useState(false);
  const [lastAmount, setLastAmount] = useState(0n);
  const [lastRecipient, setLastRecipient] = useState("");
  const transferMutation = useTransferIcp();

  const set =
    (key: keyof TransferState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const amountE8s = form.amount
    ? BigInt(Math.round(Number.parseFloat(form.amount) * 1e8))
    : 0n;
  const isValid =
    form.recipient.trim().length > 0 && amountE8s > 0n && amountE8s <= balance;

  const handleSend = async () => {
    if (!isValid) return;
    try {
      setLastAmount(amountE8s);
      setLastRecipient(form.recipient.trim());
      await transferMutation.mutateAsync({
        toAccountId: form.recipient.trim(),
        amountE8s,
        memo: form.memo.trim(),
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setForm(DEFAULT_FORM);
        onSuccess();
      }, 2500);
    } catch {
      // error handled inside mutation
    }
  };

  if (sent) {
    return (
      <div
        data-ocid="transfer.success_state"
        className="flex flex-col items-center justify-center gap-3 py-10 text-center border border-accent/30 bg-accent/5"
      >
        <CheckCircle2 className="h-10 w-10 text-accent" />
        <p className="font-mono text-sm font-semibold text-foreground uppercase tracking-[0.15em]">
          TRANSFER_SENT
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          {formatIcp(lastAmount)} ICP → {truncateAccountId(lastRecipient, 8, 8)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono">
      <div className="space-y-1.5">
        <Label
          htmlFor="recipient"
          className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
        >
          RECIPIENT ACCOUNT ID
        </Label>
        <Input
          id="recipient"
          data-ocid="transfer.recipient.input"
          placeholder="64-character hex account ID"
          value={form.recipient}
          onChange={set("recipient")}
          className="font-mono text-xs h-9 bg-background border-border/60 focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label
            htmlFor="amount"
            className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
          >
            AMOUNT (ICP)
          </Label>
          <Input
            id="amount"
            data-ocid="transfer.amount.input"
            type="number"
            placeholder="0.00"
            min="0"
            step="0.00000001"
            value={form.amount}
            onChange={set("amount")}
            className="font-mono h-9 bg-background border-border/60 focus:border-primary"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="memo"
            className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
          >
            MEMO <span className="text-muted-foreground/50">(OPT)</span>
          </Label>
          <Input
            id="memo"
            data-ocid="transfer.memo.input"
            placeholder="Reference note"
            value={form.memo}
            onChange={set("memo")}
            className="font-mono h-9 bg-background border-border/60 focus:border-primary"
          />
        </div>
      </div>

      {form.amount && amountE8s > balance && (
        <p
          data-ocid="transfer.field_error"
          className="font-mono text-xs text-destructive bg-destructive/10 border border-destructive/40 px-3 py-1.5 uppercase tracking-[0.12em]"
        >
          ERR: INSUFFICIENT BALANCE — AVAILABLE: {formatIcp(balance)} ICP
        </p>
      )}

      <Button
        data-ocid="transfer.submit_button"
        className="w-full h-9 gap-2 font-mono text-xs tracking-[0.15em] uppercase"
        disabled={!isValid || transferMutation.isPending}
        onClick={handleSend}
      >
        <SendHorizonal className="h-3.5 w-3.5" />
        {transferMutation.isPending ? "TRANSMITTING…" : "[ENTER] SEND ICP"}
      </Button>
    </div>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────

function TxRow({ tx, index }: { tx: Transaction; index: number }) {
  const isTopUp = tx.kind.__kind__ === "topUp";
  const targetLabel =
    tx.kind.__kind__ === "topUp"
      ? tx.kind.topUp.canisterId.toText()
      : tx.kind.icpTransfer.toAccountId;

  return (
    <TooltipProvider delayDuration={300}>
      <div
        data-ocid={`transactions.item.${index + 1}`}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 border border-border/40 bg-card/60 font-mono",
          "hover:bg-card hover:border-primary/20 transition-colors duration-150",
        )}
      >
        {/* ASCII prefix */}
        <span className="text-primary/30 text-[10px] select-none shrink-0">
          ├─
        </span>

        {/* Type icon */}
        <div
          className={cn(
            "flex items-center justify-center h-7 w-7 border shrink-0",
            isTopUp
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-primary/40 bg-primary/10 text-primary",
          )}
        >
          {isTopUp ? (
            <Zap className="h-3 w-3" />
          ) : (
            <ArrowUpRight className="h-3 w-3" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-medium text-foreground uppercase tracking-[0.1em]">
              {isTopUp ? "CYCLE_TOPUP" : "ICP_TRANSFER"}
            </span>
            {tx.memo && (
              <span className="font-mono text-[10px] text-muted-foreground/60 truncate max-w-[140px]">
                {tx.memo}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>{isTopUp ? "→CANISTER:" : "→ACCOUNT:"}</span>
            <span className="font-mono opacity-70 truncate max-w-[120px]">
              {truncateAccountId(targetLabel, 6, 6)}
            </span>
          </div>
        </div>

        {/* Amount + timestamp */}
        <div className="text-right shrink-0 space-y-0.5">
          <div
            className={cn(
              "font-mono text-xs font-semibold tabular-nums",
              isTopUp ? "text-accent" : "text-primary",
            )}
          >
            {isTopUp ? "+" : "−"}
            {formatIcp(tx.amountE8s)} ICP
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-end gap-1 font-mono text-[10px] text-muted-foreground cursor-default">
                <Clock className="h-2.5 w-2.5" />
                {formatRelativeTime(tx.timestamp)}
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="font-mono text-xs">
              {formatTimestamp(tx.timestamp)}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────

function TxSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 border border-border/30 bg-card/60">
      <Skeleton className="h-7 w-7 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-2.5 w-48" />
      </div>
      <div className="text-right space-y-1.5">
        <Skeleton className="h-3 w-20 ml-auto" />
        <Skeleton className="h-2.5 w-16 ml-auto" />
      </div>
    </div>
  );
}

// ─── Account Page ─────────────────────────────────────────────────────────

export default function Account() {
  const [txPage, setTxPage] = useState(0n);
  const pageNum = Number(txPage) + 1;

  const { data: account, isLoading: accountLoading } = useGetMyAccount();
  const {
    data: balanceRaw,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useGetMyBalance();
  const { data: txData, isLoading: txLoading } =
    useGetTransactionHistory(txPage);

  const balance = balanceRaw ?? 0n;
  const transactions = txData?.items ?? [];
  const totalTxPages = txData
    ? Math.max(1, Math.ceil(Number(txData.total) / 20))
    : 1;

  return (
    <div
      data-ocid="account.page"
      className="max-w-4xl mx-auto space-y-4 px-4 py-6 font-mono"
    >
      {/* Page header */}
      <div className="terminal-card border border-border/50 bg-card px-4 py-3 flex items-center gap-3">
        <div className="h-8 w-8 border border-primary/40 bg-primary/10 flex items-center justify-center retro-box-glow">
          <Wallet className="h-4 w-4 text-primary" />
        </div>
        <div>
          <div className="font-mono text-[9px] text-primary/40 tracking-widest select-none mb-0.5">
            ┌─[ ACCOUNT TERMINAL ]
          </div>
          <h1 className="font-mono text-base font-bold text-primary tracking-[0.2em] uppercase retro-glow">
            &gt;_ MY ACCOUNT
          </h1>
          <p className="font-mono text-[10px] text-muted-foreground tracking-[0.12em]">
            MANAGE ICP BALANCE &amp; TRANSFERS
          </p>
        </div>
      </div>

      {/* Balance + Account ID row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Balance card */}
        <div
          data-ocid="account.balance.card"
          className="terminal-card border border-border/50 bg-card hover:border-primary/30 transition-colors duration-150"
        >
          <div className="border-b border-border/30 px-3 py-1.5">
            <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
              ─── ICP BALANCE ───
            </p>
          </div>
          <div className="px-4 py-3">
            {balanceLoading ? (
              <Skeleton className="h-10 w-36" />
            ) : (
              <div className="flex items-end gap-2">
                <span className="font-mono text-4xl font-bold text-primary tabular-nums retro-glow">
                  {formatIcp(balance)}
                </span>
                <span className="font-mono text-base text-muted-foreground mb-1 tracking-[0.1em]">
                  ICP
                </span>
              </div>
            )}
            <p className="font-mono text-[10px] text-muted-foreground mt-1.5 tracking-wider">
              AVAILABLE TO SEND OR TOP-UP CANISTERS
            </p>
          </div>
        </div>

        {/* Account ID card */}
        <div
          data-ocid="account.id.card"
          className="terminal-card border border-border/50 bg-card hover:border-primary/30 transition-colors duration-150"
        >
          <div className="border-b border-border/30 px-3 py-1.5">
            <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
              ─── ACCOUNT ID ───
            </p>
          </div>
          <div className="px-4 py-3 space-y-2">
            {accountLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : account ? (
              <>
                <CopyableId
                  data-ocid="account.account_id.copy"
                  id={account.accountId}
                  label="Account ID"
                  startChars={8}
                  endChars={8}
                  className="w-full justify-between px-3 py-2 font-mono text-xs"
                />
                <p className="font-mono text-[10px] text-muted-foreground tracking-wider">
                  SEND ICP TO THIS ADDRESS FROM ANY WALLET
                </p>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Send ICP */}
      <div
        data-ocid="transfer.card"
        className="terminal-card border border-border/50 bg-card"
      >
        <div className="border-b border-border/40 px-4 py-2 flex items-center gap-2">
          <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
          <h2 className="font-mono text-xs font-semibold text-primary uppercase tracking-[0.2em] retro-glow-sm">
            SEND ICP
          </h2>
        </div>
        <div className="p-4">
          <SendIcpForm
            balance={balance}
            onSuccess={() => {
              refetchBalance();
            }}
          />
        </div>
      </div>

      {/* Transaction history */}
      <div
        data-ocid="transactions.card"
        className="terminal-card border border-border/50 bg-card"
      >
        <div className="border-b border-border/40 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="font-mono text-xs font-semibold text-primary uppercase tracking-[0.2em] retro-glow-sm">
              TRANSACTION HISTORY
            </h2>
          </div>
          {txData && txData.total > 0n && (
            <span
              className="font-mono text-[10px] px-1.5 py-0.5 border border-border/50 text-muted-foreground uppercase tracking-[0.15em]"
              data-ocid="transactions.total.badge"
            >
              {txData.total.toString()} TOTAL
            </span>
          )}
        </div>

        <div className="p-3 space-y-1.5">
          {txLoading ? (
            <>
              <TxSkeleton />
              <TxSkeleton />
              <TxSkeleton />
              <div data-ocid="transactions.loading_state" className="sr-only">
                Loading transactions…
              </div>
            </>
          ) : transactions.length === 0 ? (
            <div
              data-ocid="transactions.empty_state"
              className="flex flex-col items-center justify-center gap-3 py-12 text-center"
            >
              <div className="h-12 w-12 border border-border/40 bg-muted flex items-center justify-center">
                <Layers className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <div>
                <p className="font-mono text-xs font-medium text-foreground uppercase tracking-[0.15em]">
                  NO_TRANSACTIONS_FOUND
                </p>
                <p className="font-mono text-[10px] text-muted-foreground mt-1 max-w-[260px]">
                  TRANSACTIONS APPEAR HERE AFTER TOPPING UP CANISTERS OR SENDING
                  ICP
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                {transactions.map((tx, i) => (
                  <TxRow key={tx.id.toString()} tx={tx} index={i} />
                ))}
              </div>

              {totalTxPages > 1 && (
                <div className="pt-2 border-t border-border/30">
                  <PaginationControls
                    data-ocid="transactions.pagination"
                    page={pageNum}
                    totalPages={totalTxPages}
                    onPrev={() => setTxPage((p) => (p > 0n ? p - 1n : 0n))}
                    onNext={() => setTxPage((p) => p + 1n)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

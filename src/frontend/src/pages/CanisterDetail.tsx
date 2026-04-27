import type {
  CanisterDetails,
  CanisterSummary,
  Transaction,
} from "@/backend.d";
import { CopyableId } from "@/components/CopyableId";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAppPrincipal,
  useGetCanisterDetails,
  useGetIcpXdrConversionRate,
  useGetTransactionHistory,
} from "@/hooks/useBackend";
import {
  useAddController,
  useRemoveController,
  useRenameCanister,
  useTopUpCanister,
  useTransferCycles,
} from "@/hooks/useCanisterMutations";
import {
  formatCycles,
  formatIcp,
  formatTimestamp,
  truncatePrincipal,
} from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRightLeft,
  Check,
  Info,
  Pencil,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

// ─── ICP <-> Cycles estimation ───────────────────────────────────────────────
// Fallback rate: 10T cycles/ICP — conservative floor used when live rate unavailable
const FALLBACK_CYCLES_PER_ICP = 10_000_000_000_000;

function icpToEstimatedCycles(icpAmount: number, cyclesPerIcp: number): bigint {
  return BigInt(Math.floor(icpAmount * cyclesPerIcp));
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="space-y-4 font-mono">
      <Skeleton className="h-8 w-48" />
      <div className="border border-border/40 bg-card p-5 space-y-4">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-14 w-full" />
      </div>
      <div className="border border-border/40 bg-card p-5 space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────
function DetailError({ canisterId }: { canisterId: string }) {
  return (
    <div
      data-ocid="canister_detail.error_state"
      className="flex flex-col items-center justify-center py-20 gap-4 text-center font-mono"
    >
      <div className="flex h-12 w-12 items-center justify-center border border-destructive/50 bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <div>
        <p className="font-mono text-sm font-semibold text-foreground uppercase tracking-[0.2em]">
          ERR: CANISTER_NOT_FOUND
        </p>
        <p className="font-mono text-[10px] text-muted-foreground mt-1 max-w-xs tracking-wider">
          COULD NOT LOAD DETAILS FOR{" "}
          <span className="font-mono break-all text-foreground">
            {canisterId}
          </span>
          . IT MAY NOT BE TRACKED OR YOU MAY NOT HAVE ACCESS.
        </p>
      </div>
      <Link to="/canisters">
        <Button
          variant="outline"
          size="sm"
          className="font-mono text-xs tracking-[0.15em] uppercase gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          BACK TO CANISTERS
        </Button>
      </Link>
    </div>
  );
}

// ─── Inline name editor ───────────────────────────────────────────────────────
function InlineNameEditor({
  canisterId,
  currentName,
}: {
  canisterId: string;
  currentName: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentName);
  const inputRef = useRef<HTMLInputElement>(null);
  const rename = useRenameCanister();

  useEffect(() => {
    if (editing) inputRef.current?.focus();
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
      { onSettled: () => setEditing(false) },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setValue(currentName);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          data-ocid="canister_detail.name_input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 font-mono text-base font-bold bg-background border-primary/40 focus:border-primary max-w-xs"
          disabled={rename.isPending}
        />
        <button
          type="button"
          aria-label="Save name"
          data-ocid="canister_detail.name_save_button"
          onClick={handleSave}
          disabled={rename.isPending}
          className="flex h-7 w-7 items-center justify-center border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          {rename.isPending ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Check className="h-3 w-3" />
          )}
        </button>
        <button
          type="button"
          aria-label="Cancel edit"
          data-ocid="canister_detail.name_cancel_button"
          onClick={() => {
            setValue(currentName);
            setEditing(false);
          }}
          className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border/40 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <h1 className="font-mono text-xl font-bold text-foreground leading-tight uppercase tracking-[0.12em] retro-glow-sm">
        {currentName || truncatePrincipal(canisterId)}
      </h1>
      <button
        type="button"
        aria-label="Edit canister name"
        data-ocid="canister_detail.name_edit_button"
        onClick={() => setEditing(true)}
        className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border/40 transition-all"
      >
        <Pencil className="h-2.5 w-2.5" />
      </button>
    </div>
  );
}

// ─── Add controller modal ─────────────────────────────────────────────────────
function AddControllerModal({
  open,
  canisterId,
  onClose,
}: {
  open: boolean;
  canisterId: string;
  onClose: () => void;
}) {
  const [principal, setPrincipal] = useState("");
  const addController = useAddController();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = principal.trim();
    if (!trimmed) return;
    addController.mutate(
      { canisterId, controller: trimmed },
      {
        onSuccess: () => {
          setPrincipal("");
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="canister_detail.add_controller_dialog"
        className="sm:max-w-md font-mono border-primary/40"
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-sm tracking-[0.2em] text-primary uppercase retro-glow-sm">
            &gt;_ ADD CONTROLLER
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="controller-principal"
              className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
            >
              PRINCIPAL ID
            </Label>
            <Input
              id="controller-principal"
              data-ocid="canister_detail.add_controller_input"
              placeholder="aaaaa-aa..."
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="font-mono text-xs bg-background border-primary/30 focus:border-primary"
              autoComplete="off"
              spellCheck={false}
            />
            <p className="font-mono text-[10px] text-muted-foreground tracking-wider">
              ENTER THE PRINCIPAL ID TO GRANT CONTROLLER ACCESS.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="canister_detail.add_controller_cancel_button"
              onClick={onClose}
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
            >
              [ESC] CANCEL
            </Button>
            <Button
              type="submit"
              data-ocid="canister_detail.add_controller_confirm_button"
              disabled={!principal.trim() || addController.isPending}
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
            >
              {addController.isPending ? (
                <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5 mr-2" />
              )}
              ADD
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Top-up section ───────────────────────────────────────────────────────────
function TopUpSection({
  canisterId,
  currentCycles,
}: {
  canisterId: string;
  currentCycles: bigint;
}) {
  const [icpInput, setIcpInput] = useState("");
  const topUp = useTopUpCanister();
  const { data: liveRate, isLoading: rateLoading } =
    useGetIcpXdrConversionRate();

  // Use live rate if available; fall back to conservative constant
  const cyclesPerIcp =
    liveRate && liveRate > 0n ? Number(liveRate) : FALLBACK_CYCLES_PER_ICP;
  const usingFallbackRate = !rateLoading && (!liveRate || liveRate === 0n);

  const icpAmount = Number.parseFloat(icpInput) || 0;
  const estimatedCycles =
    icpAmount > 0 ? icpToEstimatedCycles(icpAmount, cyclesPerIcp) : 0n;
  const e8s = BigInt(Math.floor(icpAmount * 100_000_000));

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!icpAmount || icpAmount <= 0) return;
    topUp.mutate(
      { canisterId, icpAmountE8s: e8s },
      { onSuccess: () => setIcpInput("") },
    );
  };

  return (
    <div
      className="terminal-card border border-border/50 bg-card"
      data-ocid="canister_detail.topup_section"
    >
      <div className="border-b border-border/40 px-4 py-2 flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 text-primary" />
        <h2 className="font-mono text-xs font-semibold text-primary uppercase tracking-[0.2em] retro-glow-sm">
          TOP UP CYCLES
        </h2>
      </div>
      <div className="p-4">
        {/* Current balance display */}
        <div className="mb-4 p-3 border border-primary/30 bg-primary/5 retro-box-glow">
          <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em] mb-1">
            ─── CURRENT BALANCE ───
          </p>
          <p className="font-mono text-3xl font-bold text-primary tabular-nums retro-glow">
            {formatCycles(currentCycles)}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground tracking-[0.12em] mt-0.5">
            CYCLES REMAINING
          </p>
        </div>

        <form onSubmit={handleTopUp} className="space-y-4 font-mono">
          <div className="space-y-1.5">
            <Label
              htmlFor="icp-topup"
              className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
            >
              ICP AMOUNT
            </Label>
            <div className="relative">
              <Input
                id="icp-topup"
                data-ocid="canister_detail.topup_input"
                type="number"
                placeholder="0.5"
                min="0"
                step="0.0001"
                value={icpInput}
                onChange={(e) => setIcpInput(e.target.value)}
                className="font-mono pr-12 bg-background border-border/50 focus:border-primary"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs font-medium text-muted-foreground">
                ICP
              </span>
            </div>
            {/* Live conversion rate display */}
            <p className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-wider">
              {rateLoading
                ? "FETCHING LIVE RATE…"
                : usingFallbackRate
                  ? `RATE: ~${(FALLBACK_CYCLES_PER_ICP / 1e12).toFixed(1)}T CYCLES/ICP (EST)`
                  : `RATE: ${(cyclesPerIcp / 1e12).toFixed(2)}T CYCLES/ICP (LIVE)`}
            </p>
          </div>
          {estimatedCycles > 0n && (
            <div
              data-ocid="canister_detail.cycles_estimate"
              className="flex items-center justify-between border border-primary/30 bg-primary/8 px-4 py-2.5"
            >
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
                EST. CYCLES
              </span>
              <span className="font-mono text-base font-bold text-primary tabular-nums retro-glow">
                +{formatCycles(estimatedCycles)}
              </span>
            </div>
          )}
          <Button
            type="submit"
            data-ocid="canister_detail.topup_submit_button"
            className="w-full font-mono text-xs tracking-[0.15em] uppercase gap-1.5"
            disabled={!icpAmount || icpAmount <= 0 || topUp.isPending}
          >
            {topUp.isPending ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5" />
            )}
            {topUp.isPending ? "PROCESSING…" : "[ENTER] TOP UP CANISTER"}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ─── Transfer cycles section ──────────────────────────────────────────────────
function TransferCyclesSection({ canisterId }: { canisterId: string }) {
  const [targetId, setTargetId] = useState("");
  const [cyclesInput, setCyclesInput] = useState("");
  const transfer = useTransferCycles();

  const cyclesAmount = BigInt(
    Math.floor(Number.parseFloat(cyclesInput.replace(/_/g, "")) || 0),
  );
  const isDisabled =
    !targetId.trim() || cyclesAmount <= 0n || transfer.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    transfer.mutate(
      {
        fromCanisterId: canisterId,
        toCanisterId: targetId.trim(),
        amount: cyclesAmount,
      },
      {
        onSuccess: () => {
          setTargetId("");
          setCyclesInput("");
        },
      },
    );
  };

  return (
    <div
      className="terminal-card border border-border/50 bg-card"
      data-ocid="canister_detail.transfer_cycles_section"
    >
      {/* Header */}
      <div className="border-b border-border/40 px-4 py-2 flex items-center gap-2">
        <ArrowRightLeft className="h-3.5 w-3.5 text-primary" />
        <h2 className="font-mono text-xs font-semibold text-primary uppercase tracking-[0.2em] retro-glow-sm">
          TRANSFER CYCLES
        </h2>
      </div>

      <div className="p-4">
        {/* Info banner */}
        <div className="mb-4 border border-primary/20 bg-primary/5 px-3 py-2.5 font-mono">
          <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.15em] leading-relaxed">
            ─── MOVE EXCESS CYCLES ──────────────────────────────
            <br />
            TRANSFER CYCLES FROM THIS CANISTER TO ANY DESTINATION CANISTER ID.
            ONLY AVAILABLE WHEN THIS APP IS A CONTROLLER.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono">
          {/* Target canister ID */}
          <div className="space-y-1.5">
            <label
              htmlFor="transfer-target-id"
              className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
            >
              TARGET_CANISTER_ID:
            </label>
            <Input
              id="transfer-target-id"
              data-ocid="canister_detail.transfer_target_input"
              placeholder="aaaaa-aa..."
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="font-mono text-xs bg-background border-border/50 focus:border-primary"
              autoComplete="off"
              spellCheck={false}
              disabled={transfer.isPending}
            />
          </div>

          {/* Cycles amount */}
          <div className="space-y-1.5">
            <label
              htmlFor="transfer-cycles-amount"
              className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
            >
              CYCLES_AMOUNT:
            </label>
            <div className="relative">
              <Input
                id="transfer-cycles-amount"
                data-ocid="canister_detail.transfer_cycles_input"
                type="number"
                placeholder="100000000000"
                min="0"
                step="1"
                value={cyclesInput}
                onChange={(e) => setCyclesInput(e.target.value)}
                className="font-mono pr-16 bg-background border-border/50 focus:border-primary"
                disabled={transfer.isPending}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                CYC
              </span>
            </div>
            {cyclesAmount > 0n && (
              <p className="font-mono text-[9px] text-primary/70 tracking-wider">
                ≈ {formatCycles(cyclesAmount)} TO SEND
              </p>
            )}
          </div>

          {/* Send button */}
          <Button
            type="submit"
            data-ocid="canister_detail.transfer_cycles_submit_button"
            className="w-full font-mono text-xs tracking-[0.15em] uppercase gap-1.5"
            disabled={isDisabled}
          >
            {transfer.isPending ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowRightLeft className="h-3.5 w-3.5" />
            )}
            {transfer.isPending ? "TRANSFERRING…" : "[ENTER] SEND CYCLES"}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ─── App controller PID banner ────────────────────────────────────────────────
function AppControllerBanner({ appPrincipal }: { appPrincipal: string }) {
  if (!appPrincipal) return null;

  return (
    <div
      data-ocid="canister_detail.app_controller_banner"
      className="border border-primary/30 bg-primary/5 px-3 py-3 mb-3 font-mono retro-box-glow"
    >
      <div className="flex items-start gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 mt-0.5">
          <Info className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs font-semibold text-foreground mb-0.5 uppercase tracking-[0.12em]">
            ADD THIS APP AS A CONTROLLER
          </p>
          <p className="font-mono text-[10px] text-muted-foreground mb-2 tracking-wider">
            COPY THE APP CONTROLLER PID BELOW AND ADD IT AS A CONTROLLER SO
            CANISTERS CAN MANAGE CYCLES ON YOUR BEHALF.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
              APP CONTROLLER PID:
            </span>
            <CopyableId
              id={appPrincipal}
              label="App Principal"
              startChars={8}
              endChars={8}
              data-ocid="canister_detail.app_principal_copy"
              className="font-mono text-xs font-medium text-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Controllers section ──────────────────────────────────────────────────────
function ControllersSection({
  canisterId,
  controllers,
  appPrincipal,
}: {
  canisterId: string;
  controllers: string[];
  appPrincipal: string;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const removeController = useRemoveController();

  return (
    <div
      className="terminal-card border border-border/50 bg-card"
      data-ocid="canister_detail.controllers_section"
    >
      <div className="border-b border-border/40 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <h2 className="font-mono text-xs font-semibold text-primary uppercase tracking-[0.2em] retro-glow-sm">
            CONTROLLERS
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          data-ocid="canister_detail.add_controller_open_modal_button"
          onClick={() => setAddOpen(true)}
          className="h-7 font-mono text-[10px] tracking-[0.15em] uppercase gap-1 border-border/50 hover:border-primary/40"
        >
          <Plus className="h-3 w-3" />
          ADD
        </Button>
      </div>
      <div className="p-4">
        <AppControllerBanner appPrincipal={appPrincipal} />

        {controllers.length === 0 ? (
          <p
            data-ocid="canister_detail.controllers_empty_state"
            className="font-mono text-[10px] text-muted-foreground text-center py-4 uppercase tracking-[0.15em]"
          >
            NO_CONTROLLERS_FOUND
          </p>
        ) : (
          <ul className="space-y-1.5">
            {controllers.map((ctrl, idx) => {
              const isApp = ctrl === appPrincipal;
              return (
                <li
                  key={ctrl}
                  data-ocid={`canister_detail.controller_item.${idx + 1}`}
                  className="flex items-center justify-between gap-2 border border-border/40 bg-muted/20 px-3 py-2 hover:border-primary/20 transition-colors duration-100 font-mono"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-primary/40 text-[10px] select-none shrink-0">
                      ├─
                    </span>
                    <CopyableId
                      id={ctrl}
                      label="Controller"
                      startChars={6}
                      endChars={6}
                      data-ocid={`canister_detail.controller_copy.${idx + 1}`}
                    />
                    {isApp && (
                      <span className="shrink-0 font-mono text-[10px] px-1.5 py-0 border border-primary/30 bg-primary/10 text-primary uppercase tracking-[0.15em]">
                        [THIS APP]
                      </span>
                    )}
                  </div>
                  {!isApp && (
                    <button
                      type="button"
                      aria-label={`Remove controller ${truncatePrincipal(ctrl)}`}
                      data-ocid={`canister_detail.remove_controller_button.${idx + 1}`}
                      disabled={removeController.isPending}
                      onClick={() =>
                        removeController.mutate({
                          canisterId,
                          controller: ctrl,
                        })
                      }
                      className="shrink-0 flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/30 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <AddControllerModal
        open={addOpen}
        canisterId={canisterId}
        onClose={() => setAddOpen(false)}
      />
    </div>
  );
}

// ─── Transaction row ──────────────────────────────────────────────────────────
function TxRow({ tx, index }: { tx: Transaction; index: number }) {
  const isTopUp = tx.kind.__kind__ === "topUp";
  const cyclesAdded =
    isTopUp && tx.kind.__kind__ === "topUp" ? tx.kind.topUp.cyclesAdded : null;

  return (
    <div
      data-ocid={`canister_detail.tx_item.${index}`}
      className="flex items-start justify-between gap-4 border border-border/30 bg-muted/10 px-3 py-2.5 font-mono hover:border-primary/20 transition-colors duration-100"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-primary/40 text-[10px] select-none shrink-0">
          └─
        </span>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-primary/30 bg-primary/8">
          <Zap className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-xs font-medium text-foreground uppercase tracking-[0.1em]">
            TOP_UP
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">
            {formatTimestamp(tx.timestamp)}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-mono text-xs font-semibold text-foreground tabular-nums">
          {formatIcp(tx.amountE8s)} ICP
        </p>
        {cyclesAdded !== null && (
          <p className="font-mono text-[10px] text-primary tabular-nums retro-glow-sm">
            +{formatCycles(cyclesAdded)} CYCLES
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Transaction history section ──────────────────────────────────────────────
function TransactionHistorySection({ canisterId }: { canisterId: string }) {
  const [page, setPage] = useState(0n);
  const { data, isLoading } = useGetTransactionHistory(page);

  const filtered = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter(
      (tx) =>
        tx.kind.__kind__ === "topUp" &&
        tx.kind.topUp.canisterId.toText() === canisterId,
    );
  }, [data, canisterId]);

  const totalPages = data
    ? Math.ceil(Number(data.total) / Number(data.pageSize))
    : 0;
  const currentPage = data ? Number(data.page) : 0;

  return (
    <div
      className="terminal-card border border-border/50 bg-card"
      data-ocid="canister_detail.tx_section"
    >
      <div className="border-b border-border/40 px-4 py-2 flex items-center gap-2">
        <RefreshCw className="h-3.5 w-3.5 text-primary" />
        <h2 className="font-mono text-xs font-semibold text-primary uppercase tracking-[0.2em] retro-glow-sm">
          TRANSACTION HISTORY
        </h2>
      </div>
      <div className="p-4 space-y-2">
        {isLoading ? (
          <div
            data-ocid="canister_detail.tx_loading_state"
            className="space-y-1.5"
          >
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="canister_detail.tx_empty_state"
            className="flex flex-col items-center py-8 gap-2 text-center"
          >
            <RefreshCw className="h-7 w-7 text-muted-foreground/40" />
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
              NO_TOPUP_TRANSACTIONS_FOUND
            </p>
          </div>
        ) : (
          <>
            {filtered.map((tx, idx) => (
              <TxRow key={tx.id.toString()} tx={tx} index={idx + 1} />
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <span className="font-mono text-[10px] text-muted-foreground tracking-wider">
                  PAGE {currentPage + 1} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    data-ocid="canister_detail.tx_pagination_prev"
                    disabled={page === 0n}
                    onClick={() => setPage((p) => (p > 0n ? p - 1n : 0n))}
                    className="h-6 font-mono text-[10px] tracking-[0.15em] uppercase"
                  >
                    [PREV]
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    data-ocid="canister_detail.tx_pagination_next"
                    disabled={currentPage + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1n)}
                    className="h-6 font-mono text-[10px] tracking-[0.15em] uppercase"
                  >
                    [NEXT]
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Hero stats row ───────────────────────────────────────────────────────────
function HeroStats({ details }: { details: CanisterDetails }) {
  const canisterId = details.canisterId.toText();

  return (
    <div
      className="terminal-card border border-primary/30 bg-card overflow-hidden retro-box-glow"
      data-ocid="canister_detail.overview_card"
    >
      {/* Phosphor top stripe */}
      <div className="h-0.5 bg-primary retro-glow" />
      <div className="p-5">
        {/* Name + status row */}
        <div className="flex flex-wrap items-start gap-3 mb-5">
          <div className="flex-1 min-w-0">
            <InlineNameEditor
              canisterId={canisterId}
              currentName={details.customName}
            />
            <div className="mt-1 flex items-center gap-2">
              <CopyableId
                id={canisterId}
                label="Canister ID"
                startChars={8}
                endChars={8}
                data-ocid="canister_detail.canister_id_copy"
                className="font-mono text-xs"
              />
            </div>
          </div>
          <StatusBadge status={details.status} className="shrink-0 mt-1" />
        </div>

        {/* Cycle balance hero display */}
        <div className="border border-primary/30 bg-primary/5 px-5 py-4 mb-4 retro-box-glow">
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground mb-1">
            ─── CYCLE BALANCE ───
          </p>
          <p
            data-ocid="canister_detail.cycle_balance"
            className="font-mono text-5xl font-bold text-primary tabular-nums leading-tight retro-glow"
          >
            {formatCycles(details.cycleBalance)}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground mt-1 uppercase tracking-[0.12em]">
            CYCLES REMAINING
          </p>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-border/40 bg-muted/20 px-3 py-2.5">
            <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em] mb-0.5">
              LAST_CHECKED
            </p>
            <p className="font-mono text-xs text-foreground truncate">
              {formatTimestamp(details.lastChecked)}
            </p>
          </div>
          <div className="border border-border/40 bg-muted/20 px-3 py-2.5">
            <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em] mb-0.5">
              CREATED
            </p>
            <p className="font-mono text-xs text-foreground truncate">
              {formatTimestamp(details.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CanisterDetail() {
  const { canisterId } = useParams({ strict: false });
  const queryClient = useQueryClient();

  const { data: appPrincipal } = useGetAppPrincipal();

  const {
    data: details,
    isLoading,
    isError,
  } = useGetCanisterDetails(canisterId);

  const controllers = useMemo(
    () => (details?.controllers ?? []).map((c) => c.toText()),
    [details],
  );

  // Primary: compute from live controllers array once both are available.
  // Fallback: use the isController flag from the cached CanisterSummary in the
  // list query — this is pre-populated by the backend and is accurate from
  // the moment the page loads, covering the race where appPrincipal hasn't
  // resolved yet or getCanisterDetails is still loading.
  const cachedSummaryIsController = useMemo((): boolean | undefined => {
    if (!canisterId) return undefined;
    // Search all cached list pages for a CanisterSummary matching this canisterId
    const allQueries = queryClient.getQueriesData<{
      items?: CanisterSummary[];
    }>({
      queryKey: ["canisters", "list"],
    });
    for (const [, page] of allQueries) {
      const match = page?.items?.find(
        (c) => c.canisterId.toString() === canisterId,
      );
      if (match !== undefined) return match.isController;
    }
    // Also check search cache
    const searchQueries = queryClient.getQueriesData<CanisterSummary[]>({
      queryKey: ["canisters", "search"],
    });
    for (const [, results] of searchQueries) {
      const match = results?.find(
        (c) => c.canisterId.toString() === canisterId,
      );
      if (match !== undefined) return match.isController;
    }
    return undefined;
  }, [canisterId, queryClient]); // re-run when canisterId or queryClient changes

  const isController = useMemo(() => {
    // If we have both appPrincipal and controllers from live data, use that
    if (appPrincipal && controllers.length > 0) {
      return controllers.includes(appPrincipal);
    }
    // Fall back to the cached CanisterSummary flag while data is loading
    if (cachedSummaryIsController !== undefined) {
      return cachedSummaryIsController;
    }
    return false;
  }, [controllers, appPrincipal, cachedSummaryIsController]);

  if (!canisterId) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-4 font-mono">
      {/* Back nav */}
      <Link
        to="/canisters"
        data-ocid="canister_detail.back_link"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors group uppercase tracking-[0.12em]"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        [←] BACK TO CANISTERS
      </Link>

      {/* Content */}
      {isLoading ? (
        <div data-ocid="canister_detail.loading_state">
          <DetailSkeleton />
        </div>
      ) : isError || !details ? (
        <DetailError canisterId={canisterId} />
      ) : (
        <>
          <HeroStats details={details} />
          <TopUpSection
            canisterId={canisterId}
            currentCycles={details.cycleBalance ?? 0n}
          />
          {isController && <TransferCyclesSection canisterId={canisterId} />}
          <ControllersSection
            canisterId={canisterId}
            controllers={controllers}
            appPrincipal={appPrincipal ?? ""}
          />
          <TransactionHistorySection canisterId={canisterId} />
        </>
      )}
    </div>
  );
}

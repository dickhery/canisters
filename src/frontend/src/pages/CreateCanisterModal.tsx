import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetIcpXdrConversionRate, useGetMyBalance } from "@/hooks/useBackend";
import { useCreateCanister } from "@/hooks/useCanisterMutations";
import {
  estimateCreationCost,
  estimateTopUpCycles,
  FALLBACK_CYCLES_PER_ICP,
  formatCyclesPerIcp,
  parseIcpInput,
} from "@/lib/cycles";
import { formatCycles, formatIcp } from "@/lib/format";
import { useEffect, useState } from "react";

interface CreateCanisterModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateCanisterModal({
  open,
  onClose,
}: CreateCanisterModalProps) {
  const [name, setName] = useState("");
  const [seedIcpRaw, setSeedIcpRaw] = useState("0");
  const [nameError, setNameError] = useState("");

  const seedIcpE8s = parseIcpInput(seedIcpRaw);
  const seedCyclesIcpE8sNum = Number(seedIcpE8s);

  const { data: liveRate, isLoading: rateLoading } = useGetIcpXdrConversionRate({
    enabled: open,
  });
  const { data: balance } = useGetMyBalance({ enabled: open });
  const { mutate, isPending, data: createResult, reset } = useCreateCanister();

  const hasLiveRate = !rateLoading && !!liveRate && liveRate > 0n;
  const cyclesPerIcp: bigint = hasLiveRate ? liveRate : FALLBACK_CYCLES_PER_ICP;
  const estimate = estimateCreationCost(seedIcpE8s, cyclesPerIcp);

  const creationFeeE8s = estimate.creationFeeIcpE8s;
  const transferFeeE8s = estimate.transferFeeE8s;
  const totalIcpRequiredE8s = estimate.totalIcpRequiredE8s;
  const seedCycles = estimate.estimatedSeedCycles;

  const userBalance = balance ?? 0n;
  const canAfford = userBalance >= totalIcpRequiredE8s;
  const nameValid = name.trim().length > 0;
  const canSubmit = nameValid && canAfford && !isPending;

  const usingFallbackRate = !rateLoading && !hasLiveRate;

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setName("");
      setSeedIcpRaw("0");
      setNameError("");
      reset();
    }
  }, [open, reset]);

  // Close on successful creation
  useEffect(() => {
    if (createResult) {
      onClose();
    }
  }, [createResult, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
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

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="sm:max-w-lg bg-card border-primary/40 font-mono"
        data-ocid="create_canister.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-base tracking-[0.2em] text-primary uppercase retro-glow-sm">
            &gt;_ CREATE NEW CANISTER
          </DialogTitle>
          <DialogDescription className="font-mono text-[10px] text-muted-foreground tracking-[0.12em]">
            PROVISION A NEW CANISTER ON THE INTERNET COMPUTER. ICP WILL BE
            DEDUCTED FROM YOUR IN-APP BALANCE.
          </DialogDescription>
        </DialogHeader>

        {/* ── Upfront Cost Estimate Panel ── */}
        <div className="border border-primary/20 bg-background/60 p-3 space-y-2 text-[10px] font-mono tracking-[0.1em]">
          <div className="font-mono text-[9px] text-primary/40 tracking-widest select-none mb-1">
            ┌─[ COST ESTIMATE ]
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground uppercase">
              BASE CREATION FEE
            </span>
            <span className="text-primary tabular-nums retro-glow-sm">
              {formatIcp(creationFeeE8s)} ICP
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground uppercase">
              SEED CYCLES ICP
            </span>
            <span className="text-primary tabular-nums">
              {formatIcp(seedIcpE8s)} ICP
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground uppercase">
              TRANSFER FEE
            </span>
            <span className="text-primary/60 tabular-nums text-[9px]">
              {formatIcp(transferFeeE8s)} ICP
            </span>
          </div>

          <div className="border-t border-primary/20 pt-2 flex justify-between items-center">
            <span className="text-muted-foreground uppercase font-bold">
              TOTAL REQUIRED
            </span>
            <span
              className={`font-bold tabular-nums retro-glow-sm ${
                canAfford ? "text-primary" : "text-destructive"
              }`}
            >
              {rateLoading
                ? "CALCULATING…"
                : `${formatIcp(totalIcpRequiredE8s)} ICP`}
            </span>
          </div>

          <div className="flex justify-between items-center pt-0.5">
            <span className="text-muted-foreground uppercase">
              YOUR BALANCE
            </span>
            <span
              className={`tabular-nums ${
                canAfford ? "text-muted-foreground" : "text-destructive"
              }`}
            >
              {formatIcp(userBalance)} ICP
            </span>
          </div>

          {/* Live rate display */}
          <div className="flex justify-between items-center pt-0.5">
            <span className="text-muted-foreground/60 uppercase text-[9px]">
              CONVERSION RATE
            </span>
            <span className="text-muted-foreground/60 tabular-nums text-[9px]">
              {rateLoading
                ? "FETCHING…"
                : usingFallbackRate
                  ? `~${formatCyclesPerIcp(FALLBACK_CYCLES_PER_ICP)} cycles/ICP (est)`
                  : `${formatCyclesPerIcp(cyclesPerIcp)} cycles/ICP`}
            </span>
          </div>

          {!canAfford && (
            <p
              className="font-mono text-[9px] text-destructive uppercase tracking-wider pt-1"
              data-ocid="create_canister.balance_error"
            >
              ⚠ INSUFFICIENT BALANCE — DEPOSIT MORE ICP TO YOUR ACCOUNT
            </p>
          )}

          {usingFallbackRate && !rateLoading && (
            <p className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-wider pt-1">
              * RATE IS ESTIMATED — LIVE RATE UNAVAILABLE
            </p>
          )}

          {seedIcpE8s > 0n && (
            <div className="border-t border-primary/10 pt-2 flex justify-between items-center">
              <span className="text-muted-foreground uppercase text-[9px]">
                APPROX CYCLES SEEDED
              </span>
              <span className="text-accent text-[9px] tabular-nums retro-glow-accent">
                ~{formatCycles(seedCycles)}
              </span>
            </div>
          )}
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name — required */}
          <div className="space-y-1.5">
            <Label
              htmlFor="canister-create-name"
              className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
            >
              CANISTER NAME <span className="text-destructive">*</span>
            </Label>
            <Input
              id="canister-create-name"
              placeholder="e.g. My Token Ledger"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              className="font-mono text-sm bg-background border-primary/30 focus:border-primary uppercase placeholder:normal-case"
              data-ocid="create_canister.name_input"
              autoFocus
              disabled={isPending}
            />
            {nameError && (
              <p
                className="font-mono text-[10px] text-destructive uppercase tracking-wider"
                data-ocid="create_canister.name_field_error"
              >
                {nameError}
              </p>
            )}
          </div>

          {/* Seed Cycles ICP — optional */}
          <div className="space-y-1.5">
            <Label
              htmlFor="canister-seed-icp"
              className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
            >
              SEED CYCLES (ICP){" "}
              <span className="text-muted-foreground/50 font-normal">
                (OPT)
              </span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="canister-seed-icp"
                placeholder="0"
                value={seedIcpRaw}
                onChange={(e) => setSeedIcpRaw(e.target.value)}
                className="font-mono text-sm bg-background border-primary/30 focus:border-primary w-36 tabular-nums"
                data-ocid="create_canister.seed_icp_input"
                disabled={isPending}
              />
              <span className="font-mono text-[10px] text-muted-foreground uppercase">
                ICP
              </span>
              {seedIcpE8s > 0n && (
                <span className="font-mono text-[10px] text-accent/80 tabular-nums retro-glow-accent">
                  ≈{" "}
                  {formatCycles(estimateTopUpCycles(seedIcpE8s, cyclesPerIcp))}{" "}
                  cycles
                </span>
              )}
            </div>
            <p className="font-mono text-[9px] text-muted-foreground/60 tracking-wider">
              ENTER ADDITIONAL ICP TO TOP UP THE NEW CANISTER WITH CYCLES ON
              CREATION. LEAVE 0 TO ONLY PAY THE BASE CREATION FEE.
            </p>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
              data-ocid="create_canister.cancel_button"
              className="font-mono text-[10px] tracking-[0.2em] uppercase border-border/50 hover:border-border"
            >
              [ESC] CANCEL
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              data-ocid="create_canister.submit_button"
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
            >
              {isPending
                ? "PROVISIONING…"
                : !nameValid
                  ? "[ENTER NAME]"
                  : !canAfford
                    ? "[INSUFFICIENT]"
                    : "[C] CREATE"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

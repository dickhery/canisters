import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetMyBalance } from "@/hooks/useBackend";
import { useTransferIcp } from "@/hooks/useCanisterMutations";
import { formatIcp } from "@/lib/format";
import { Send } from "lucide-react";
import { useState } from "react";

interface SendIcpModalProps {
  open: boolean;
  onClose: () => void;
}

export function SendIcpModal({ open, onClose }: SendIcpModalProps) {
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const { data: balance } = useGetMyBalance();
  const { mutate: transfer, isPending } = useTransferIcp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number.parseFloat(amount);
    if (!toAccountId.trim() || Number.isNaN(amountNum) || amountNum <= 0)
      return;
    const amountE8s = BigInt(Math.round(amountNum * 100_000_000));
    transfer(
      { toAccountId: toAccountId.trim(), amountE8s, memo: memo.trim() },
      {
        onSuccess: () => {
          setToAccountId("");
          setAmount("");
          setMemo("");
          onClose();
        },
      },
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

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="sm:max-w-md bg-card border-primary/40 font-mono"
        data-ocid="send_icp.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-base tracking-[0.2em] text-primary uppercase flex items-center gap-2 retro-glow-sm">
            <Send className="h-3.5 w-3.5" />
            &gt;_ SEND ICP
          </DialogTitle>
        </DialogHeader>

        {balance !== undefined && (
          <div className="flex items-center justify-between px-3 py-2 border border-border/40 bg-muted/30">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
              AVAILABLE
            </span>
            <span className="font-mono text-sm font-semibold text-primary tabular-nums retro-glow-sm">
              {formatIcp(balance)} ICP
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div className="space-y-1.5">
            <Label
              htmlFor="to-account-id"
              className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
            >
              DESTINATION ACCOUNT ID
            </Label>
            <Input
              id="to-account-id"
              placeholder="64-character hex account ID"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="font-mono text-xs bg-background border-primary/30 focus:border-primary"
              autoComplete="off"
              spellCheck={false}
              data-ocid="send_icp.account_id_input"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="icp-amount"
              className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
            >
              AMOUNT (ICP)
            </Label>
            <Input
              id="icp-amount"
              type="number"
              step="0.00000001"
              min="0.00000001"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono text-sm bg-background border-primary/30 focus:border-primary"
              data-ocid="send_icp.amount_input"
              required
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
              placeholder="e.g. Payment for services"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="font-mono text-sm bg-background border-primary/30 focus:border-primary"
              data-ocid="send_icp.memo_input"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isPending}
              data-ocid="send_icp.cancel_button"
              className="font-mono text-[10px] tracking-[0.2em] uppercase border border-border/40 hover:border-border"
            >
              [ESC] CANCEL
            </Button>
            <Button
              type="submit"
              disabled={isPending || !toAccountId.trim() || !amount}
              data-ocid="send_icp.submit_button"
              className="font-mono text-[10px] tracking-[0.2em] uppercase gap-1.5"
            >
              <Send className="h-3 w-3" />
              {isPending ? "TRANSMITTING…" : "[ENTER] SEND ICP"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import type { CanisterStatus } from "@/backend.d";
import { CopyableId } from "@/components/CopyableId";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAppPrincipal,
  useGetMyAccount,
  useGetMyBalance,
  useListCanisters,
} from "@/hooks/useBackend";
import { useAddCanister } from "@/hooks/useCanisterMutations";
import { formatCycles, formatIcp } from "@/lib/format";
import { SendIcpModal } from "@/pages/SendIcpModal";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  CircuitBoard,
  Coins,
  Plus,
  Send,
  Server,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
  loading?: boolean;
  "data-ocid"?: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent = "text-primary",
  loading,
  "data-ocid": dataOcid,
}: StatCardProps) {
  return (
    <div
      data-ocid={dataOcid}
      className="terminal-card terminal-card-full bg-card hover:border-primary/60 transition-colors duration-150 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em] mb-2">
            ─── {label} ───
          </p>
          {loading ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <p
              className={`font-mono text-2xl font-bold tabular-nums tracking-tight retro-glow ${accent}`}
            >
              {value}
            </p>
          )}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 retro-box-glow">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
    </div>
  );
}

// ── Add Canister Modal ────────────────────────────────────────────────────────

function AddCanisterModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [canisterId, setCanisterId] = useState("");
  const [customName, setCustomName] = useState("");
  const { mutate: addCanister, isPending } = useAddCanister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canisterId.trim()) return;
    addCanister(
      { canisterId: canisterId.trim(), customName: customName.trim() },
      {
        onSuccess: () => {
          setCanisterId("");
          setCustomName("");
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="sm:max-w-md bg-card border-primary/40 font-mono"
        data-ocid="add_canister.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-base tracking-[0.2em] text-primary uppercase retro-glow-sm">
            &gt; ADD CANISTER
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="canister-id"
              className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
            >
              CANISTER ID
            </Label>
            <Input
              id="canister-id"
              placeholder="e.g. rrkah-fqaaa-aaaaa-aaaaq-cai"
              value={canisterId}
              onChange={(e) => setCanisterId(e.target.value)}
              className="font-mono text-sm bg-background border-primary/30 focus:border-primary"
              autoComplete="off"
              spellCheck={false}
              data-ocid="add_canister.input"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="canister-name"
              className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
            >
              CUSTOM NAME{" "}
              <span className="text-muted-foreground/50">(OPTIONAL)</span>
            </Label>
            <Input
              id="canister-name"
              placeholder="e.g. Ledger Service"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="font-mono text-sm bg-background border-primary/30 focus:border-primary"
              data-ocid="add_canister.name_input"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              data-ocid="add_canister.cancel_button"
              className="font-mono text-[10px] tracking-[0.2em] border border-border/50 hover:border-border uppercase"
            >
              [ESC] CANCEL
            </Button>
            <Button
              type="submit"
              disabled={isPending || !canisterId.trim()}
              data-ocid="add_canister.submit_button"
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
            >
              {isPending ? "ADDING…" : "[ENTER] ADD"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Recent Canister Row ────────────────────────────────────────────────────────

interface RecentCanisterRowProps {
  name: string;
  canisterId: string;
  cycles: bigint;
  status: CanisterStatus;
  index: number;
}

function RecentCanisterRow({
  name,
  canisterId,
  cycles,
  status,
  index,
}: RecentCanisterRowProps) {
  return (
    <Link
      to="/canisters/$canisterId"
      params={{ canisterId }}
      data-ocid={`recent_canisters.item.${index}`}
      className="group flex items-center gap-4 px-3 py-2.5 hover:bg-primary/8 transition-colors duration-100 border-b border-border/20 last:border-b-0 font-mono"
    >
      {/* ASCII prefix */}
      <span className="text-primary/40 text-[10px] shrink-0 select-none">
        ├─
      </span>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-primary/30 bg-primary/8">
        <CircuitBoard className="h-3 w-3 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono text-foreground truncate group-hover:text-primary transition-colors tracking-[0.1em] uppercase">
          {name || "UNNAMED_CANISTER"}
        </p>
        <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate tracking-wide">
          {canisterId.length > 30
            ? `${canisterId.slice(0, 14)}...${canisterId.slice(-8)}`
            : canisterId}
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        <span className="font-mono text-xs font-bold text-primary tabular-nums retro-glow-sm">
          {formatCycles(cycles)}
        </span>
        <StatusBadge status={status} />
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
  );
}

// ── Identity Card ─────────────────────────────────────────────────────────────

interface IdentityCardProps {
  label: string;
  id: string;
  description: string;
  ocid: string;
  startChars?: number;
  endChars?: number;
  loading?: boolean;
}

function IdentityCard({
  label,
  id,
  description,
  ocid,
  startChars = 6,
  endChars = 6,
  loading,
}: IdentityCardProps) {
  if (loading || !id) {
    return (
      <div className="flex flex-col gap-1.5 border border-border/40 p-3 terminal-card">
        <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
          {label}
        </span>
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 border border-border/40 p-3 hover:border-primary/40 transition-colors duration-150 terminal-card">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
          &gt; {label}
        </span>
        <span className="font-mono text-[9px] px-1.5 py-0 border border-border/40 text-muted-foreground/70 uppercase tracking-[0.1em]">
          {description}
        </span>
      </div>
      <CopyableId
        id={id}
        label={label}
        startChars={startChars}
        endChars={endChars}
        data-ocid={ocid}
        className="w-full justify-between"
      />
    </div>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [addOpen, setAddOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);

  const { identity } = useInternetIdentity();

  const userPid = identity?.getPrincipal().toText() ?? "";
  const { data: appCanisterPid = "" } = useGetAppPrincipal();

  const { data: canistersPage, isLoading: canistersLoading } =
    useListCanisters(0n);
  const { data: account, isLoading: accountLoading } = useGetMyAccount();
  const { data: balance, isLoading: balanceLoading } = useGetMyBalance();

  const canisters = canistersPage?.items ?? [];
  const totalCanisters = canistersPage?.total ?? 0n;
  // Use BigInt addition to avoid floating-point issues with large cycle counts
  const totalCycles = canisters.reduce(
    (sum, c) => sum + (c.cycleBalance ?? 0n),
    0n,
  );
  const recentCanisters = canisters.slice(0, 5);

  return (
    <div className="flex flex-col gap-5 p-4 lg:p-6 max-w-6xl mx-auto font-mono">
      {/* Page Header */}
      <div className="terminal-card terminal-card-full bg-card px-4 py-3 border border-border/60">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[9px] text-primary/50 tracking-widest select-none mb-0.5">
              ┌─[ SYSTEM OVERVIEW ]
            </div>
            <h1 className="font-mono text-base font-bold text-primary tracking-[0.2em] uppercase retro-glow">
              &gt;_ DASHBOARD
            </h1>
            <p className="font-mono text-[10px] text-muted-foreground mt-0.5 tracking-[0.12em]">
              CANISTERS &amp; ACCOUNT STATUS
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSendOpen(true)}
              data-ocid="dashboard.send_icp_button"
              className="font-mono text-[10px] tracking-[0.15em] border-primary/30 hover:border-primary/60 hover:text-primary uppercase gap-1.5"
            >
              <Send className="h-3 w-3" />
              <span className="hidden sm:inline">[S] SEND ICP</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setAddOpen(true)}
              data-ocid="dashboard.add_canister_button"
              className="font-mono text-[10px] tracking-[0.15em] uppercase gap-1.5"
            >
              <Plus className="h-3 w-3" />
              [A] ADD
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div
        data-ocid="dashboard.stats_section"
        className="grid grid-cols-2 xl:grid-cols-4 gap-3"
      >
        <StatCard
          label="Total Canisters"
          value={totalCanisters.toString()}
          icon={Server}
          accent="text-foreground"
          loading={canistersLoading}
          data-ocid="dashboard.stat.total_canisters"
        />
        <StatCard
          label="Total Cycles"
          value={formatCycles(totalCycles)}
          icon={TrendingUp}
          accent="text-primary"
          loading={canistersLoading}
          data-ocid="dashboard.stat.total_cycles"
        />
        <StatCard
          label="ICP Balance"
          value={balance !== undefined ? `${formatIcp(balance)} ICP` : "—"}
          icon={Coins}
          accent="text-accent"
          loading={balanceLoading}
          data-ocid="dashboard.stat.icp_balance"
        />
        <StatCard
          label="Account"
          value={
            account?.accountId ? (
              <span className="font-mono text-sm truncate block">
                {account.accountId.slice(0, 8)}…
              </span>
            ) : (
              "—"
            )
          }
          icon={Wallet}
          accent="text-foreground"
          loading={accountLoading}
          data-ocid="dashboard.stat.account"
        />
      </div>

      {/* Identity & Addresses */}
      <div
        className="terminal-card terminal-card-full border border-border/60 bg-card"
        data-ocid="dashboard.identity_section"
      >
        <div className="border-b border-border/40 px-4 py-2 flex items-center gap-2">
          <CircuitBoard className="h-3.5 w-3.5 text-primary" />
          <h2 className="font-mono text-xs font-semibold text-primary uppercase tracking-[0.2em] retro-glow-sm">
            IDENTITY &amp; ADDRESSES
          </h2>
          <span className="ml-auto font-mono text-[9px] text-primary/40 select-none tracking-widest">
            ──────────
          </span>
        </div>
        <div className="grid gap-0 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
          <div className="p-3">
            <IdentityCard
              label="Your Principal ID"
              id={userPid}
              description="Your identity"
              ocid="dashboard.user_pid_copy"
              startChars={8}
              endChars={6}
              loading={!userPid}
            />
          </div>
          <div className="p-3">
            <IdentityCard
              label="App Controller PID"
              id={appCanisterPid}
              description="Add as controller"
              ocid="dashboard.app_pid_copy"
              startChars={8}
              endChars={6}
              loading={!appCanisterPid}
            />
          </div>
          <div className="p-3">
            <IdentityCard
              label="Your ICP Account ID"
              id={account?.accountId ?? ""}
              description="Send ICP here"
              ocid="dashboard.account_id_copy"
              startChars={10}
              endChars={8}
              loading={accountLoading || !account?.accountId}
            />
          </div>
        </div>
      </div>

      {/* Recent Canisters */}
      <div
        className="terminal-card terminal-card-full border border-border/60 bg-card"
        data-ocid="dashboard.recent_canisters_section"
      >
        <div className="border-b border-border/40 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-3.5 w-3.5 text-primary" />
            <h2 className="font-mono text-xs font-semibold text-primary uppercase tracking-[0.2em] retro-glow-sm">
              RECENT CANISTERS
            </h2>
          </div>
          <Link
            to="/canisters"
            data-ocid="dashboard.view_all_canisters_link"
            className="flex items-center gap-1 font-mono text-[10px] text-primary hover:text-primary/70 transition-colors uppercase tracking-[0.12em]"
          >
            VIEW ALL
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="px-3 py-1">
          {canistersLoading ? (
            <div
              className="space-y-1 py-1"
              data-ocid="recent_canisters.loading_state"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-3 py-2.5">
                  <Skeleton className="h-7 w-7 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-2.5 w-56" />
                  </div>
                  <Skeleton className="h-4 w-20 hidden sm:block" />
                </div>
              ))}
            </div>
          ) : recentCanisters.length === 0 ? (
            <div
              data-ocid="recent_canisters.empty_state"
              className="flex flex-col items-center justify-center gap-3 py-10 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center border border-border/50 bg-muted">
                <Server className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-mono text-xs font-medium text-foreground uppercase tracking-[0.15em]">
                  NO_CANISTERS_FOUND
                </p>
                <p className="font-mono text-[10px] text-muted-foreground mt-1 tracking-wider">
                  ADD YOUR FIRST CANISTER TO START TRACKING CYCLES
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setAddOpen(true)}
                data-ocid="recent_canisters.add_first_button"
                className="font-mono text-[10px] tracking-[0.15em] uppercase gap-1.5"
              >
                <Plus className="h-3 w-3" />
                ADD CANISTER
              </Button>
            </div>
          ) : (
            <div className="space-y-0" data-ocid="recent_canisters.list">
              {recentCanisters.map((c, i) => (
                <RecentCanisterRow
                  key={c.canisterId.toText()}
                  name={c.customName}
                  canisterId={c.canisterId.toText()}
                  cycles={c.cycleBalance ?? 0n}
                  status={c.status}
                  index={i + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddCanisterModal open={addOpen} onClose={() => setAddOpen(false)} />
      <SendIcpModal open={sendOpen} onClose={() => setSendOpen(false)} />
    </div>
  );
}

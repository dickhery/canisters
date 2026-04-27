import type { CanisterSummary } from "@/backend.d";
import { CopyableId } from "@/components/CopyableId";
import { PaginationControls } from "@/components/PaginationControls";
import { StatusBadge } from "@/components/StatusBadge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useListCanisters, useSearchCanisters } from "@/hooks/useBackend";
import {
  useAddCanister,
  useRemoveCanister,
  useRenameCanister,
} from "@/hooks/useCanisterMutations";
import { formatCycles, formatTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CreateCanisterModal } from "@/pages/CreateCanisterModal";
import { useNavigate } from "@tanstack/react-router";
import {
  Box,
  Pencil,
  PlusCircle,
  Search,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Cycle-balance persistence helpers
// ---------------------------------------------------------------------------
// The backend may return cycleBalance=0n when an IC management call fails
// transiently.  We keep a per-canister ref of the last non-zero balance we
// ever saw and substitute it whenever a 0 would otherwise be displayed.
// ---------------------------------------------------------------------------
function useSavedCycleBalances() {
  // Map of canisterId (string) -> last known non-zero cycle balance
  const savedRef = useRef<Map<string, bigint>>(new Map());

  // The callback is stable: it only reads/writes the ref, never causes re-renders.
  const updateAndGet = useRef(
    (canisterId: string, incoming: bigint): bigint => {
      if (incoming > 0n) {
        savedRef.current.set(canisterId, incoming);
        return incoming;
      }
      // incoming is 0 — use saved non-zero value if we have one
      const saved = savedRef.current.get(canisterId);
      return saved !== undefined ? saved : 0n;
    },
  ).current;

  return { updateAndGet };
}

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

// Stagger offsets — irrational spacing so rows never re-sync
const BLINK_OFFSETS = [
  0, 0.37, 0.74, 0.13, 0.51, 0.88, 0.26, 0.63, 0.19, 0.56, 0.93, 0.31, 0.68,
  0.07, 0.44, 0.81, 0.22, 0.59, 0.96, 0.33,
];
const getBlinkDelay = (index: number) =>
  BLINK_OFFSETS[index % BLINK_OFFSETS.length];

// ─── Add Canister Modal ────────────────────────────────────────────────────────
interface AddCanisterModalProps {
  open: boolean;
  onClose: () => void;
}

function AddCanisterModal({ open, onClose }: AddCanisterModalProps) {
  const [canisterId, setCanisterId] = useState("");
  const [customName, setCustomName] = useState("");
  const [error, setError] = useState("");
  const { mutate, isPending } = useAddCanister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = canisterId.trim();
    if (!trimmed) {
      setError("CANISTER ID IS REQUIRED.");
      return;
    }
    const principalRegex =
      /^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/;
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
        },
      },
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

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="sm:max-w-md bg-card border-primary/40 font-mono"
        data-ocid="add_canister.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-base tracking-[0.2em] text-primary uppercase retro-glow-sm">
            &gt;_ TRACK NEW CANISTER
          </DialogTitle>
          <DialogDescription className="font-mono text-[10px] text-muted-foreground tracking-[0.12em]">
            PASTE YOUR CANISTER PRINCIPAL ID TO BEGIN MONITORING CYCLE BALANCE
            AND STATUS.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label
              htmlFor="canister-id"
              className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
            >
              CANISTER ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="canister-id"
              placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxxxx"
              value={canisterId}
              onChange={(e) => {
                setCanisterId(e.target.value);
                if (error) setError("");
              }}
              className="font-mono text-sm bg-background border-primary/30 focus:border-primary"
              data-ocid="add_canister.input"
              autoFocus
            />
            {error && (
              <p
                className="font-mono text-[10px] text-destructive uppercase tracking-wider"
                data-ocid="add_canister.field_error"
              >
                {error}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="canister-name"
              className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
            >
              CUSTOM NAME{" "}
              <span className="text-muted-foreground/50 font-normal">
                (OPT)
              </span>
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

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
              data-ocid="add_canister.cancel_button"
              className="font-mono text-[10px] tracking-[0.2em] uppercase border-border/50 hover:border-border"
            >
              [ESC] CANCEL
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="add_canister.submit_button"
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
            >
              {isPending ? "REGISTERING…" : "[ENTER] TRACK"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirmation Modal ─────────────────────────────────────────────────
interface DeleteConfirmProps {
  canister: CanisterSummary | null;
  onClose: () => void;
}

function DeleteConfirmModal({ canister, onClose }: DeleteConfirmProps) {
  const { mutate, isPending } = useRemoveCanister();

  const handleConfirm = () => {
    if (!canister) return;
    mutate(canister.canisterId.toString(), { onSuccess: onClose });
  };

  return (
    <Dialog
      open={!!canister}
      onOpenChange={(v) => !v && !isPending && onClose()}
    >
      <DialogContent
        className="sm:max-w-sm bg-card border-destructive/40 font-mono"
        data-ocid="delete_canister.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-sm tracking-[0.2em] text-destructive uppercase">
            ⚠ REMOVE CANISTER
          </DialogTitle>
          <DialogDescription className="font-mono text-[10px] text-muted-foreground tracking-wider">
            STOP TRACKING{" "}
            <span className="text-foreground font-medium font-mono">
              {canister?.customName ||
                `${canister?.canisterId.toString().slice(0, 12)}…`}
            </span>
            ? THIS DOES NOT DELETE THE CANISTER ON-CHAIN.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            data-ocid="delete_canister.cancel_button"
            className="font-mono text-[10px] tracking-[0.2em] uppercase"
          >
            [ESC] CANCEL
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
            data-ocid="delete_canister.confirm_button"
            className="font-mono text-[10px] tracking-[0.2em] uppercase"
          >
            {isPending ? "REMOVING…" : "[DEL] REMOVE"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Inline Rename Cell ────────────────────────────────────────────────────────
interface RenameCellProps {
  canister: CanisterSummary;
  index: number;
}

function RenameCell({ canister, index }: RenameCellProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(canister.customName);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useRenameCanister();

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed === canister.customName) {
      setEditing(false);
      return;
    }
    mutate(
      { canisterId: canister.canisterId.toString(), newName: trimmed },
      { onSettled: () => setEditing(false) },
    );
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 min-w-0">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setValue(canister.customName);
              setEditing(false);
            }
          }}
          onBlur={commit}
          className="h-6 font-mono text-xs px-2 py-0 min-w-0 max-w-[160px] bg-background border-primary/40 focus:border-primary"
          disabled={isPending}
          data-ocid={`canister.rename_input.${index}`}
        />
        <button
          type="button"
          onClick={() => {
            setValue(canister.customName);
            setEditing(false);
          }}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label="Cancel rename"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={cn(
        "group flex items-center gap-1 text-left min-w-0 w-full",
        "hover:text-primary transition-colors font-mono",
      )}
      data-ocid={`canister.name.${index}`}
      aria-label={`Rename ${canister.customName || "unnamed canister"}`}
    >
      <span className="truncate font-mono text-xs text-foreground group-hover:text-primary transition-colors uppercase tracking-[0.08em]">
        {canister.customName || (
          <span className="text-muted-foreground/60 italic">UNNAMED</span>
        )}
      </span>
      <Pencil className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
}

// ─── Controller Indicator ──────────────────────────────────────────────────────
interface CtrlBadgeProps {
  isControlled: boolean;
}

function CtrlBadge({ isControlled }: CtrlBadgeProps) {
  if (isControlled) {
    return (
      <span
        className="font-mono text-[9px] font-bold tracking-widest text-accent retro-glow-accent"
        title="App controller is set — this canister can be managed"
      >
        ◆CTRL
      </span>
    );
  }

  return (
    <span
      className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground"
      title="App controller NOT set — top-ups and controller actions may fail"
    >
      ◇NO-CTRL
    </span>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-border/30">
      <td className="px-3 py-2.5">
        <Skeleton className="h-3 w-24" />
      </td>
      <td className="px-3 py-2.5">
        <Skeleton className="h-6 w-32" />
      </td>
      <td className="px-3 py-2.5">
        <Skeleton className="h-3 w-14" />
      </td>
      <td className="px-3 py-2.5">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-3 py-2.5">
        <Skeleton className="h-3 w-24" />
      </td>
      <td className="px-3 py-2.5">
        <Skeleton className="h-6 w-6" />
      </td>
    </tr>
  );
}

// ─── Canister Row ──────────────────────────────────────────────────────────────
interface CanisterRowProps {
  canister: CanisterSummary;
  index: number;
  onDelete: (c: CanisterSummary) => void;
}

function CanisterRow({ canister, index, onDelete }: CanisterRowProps) {
  const navigate = useNavigate();

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("[data-no-navigate]")
    )
      return;
    navigate({
      to: "/canisters/$canisterId",
      params: { canisterId: canister.canisterId.toString() },
    });
  };

  const handleRowKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleRowClick(e as unknown as React.MouseEvent);
    }
  };

  return (
    <tr
      className={cn(
        "border-b border-border/20 cursor-pointer group font-mono",
        "hover:bg-primary/5 hover:border-primary/20 transition-colors duration-100",
      )}
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      data-ocid={`canister.item.${index}`}
    >
      {/* Name */}
      <td className="px-3 py-2.5 min-w-[140px] max-w-[200px]" data-no-navigate>
        <div className="flex items-center gap-1.5">
          <span className="text-primary/30 text-[10px] select-none">├─</span>
          <RenameCell canister={canister} index={index} />
        </div>
      </td>

      {/* Canister ID */}
      <td className="px-3 py-2.5 whitespace-nowrap" data-no-navigate>
        <CopyableId
          id={canister.canisterId.toString()}
          label="Canister ID"
          startChars={5}
          endChars={4}
          data-ocid={`canister.copy_id.${index}`}
        />
      </td>

      {/* Cycle Balance */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <span className="font-mono text-xs font-bold text-primary tabular-nums retro-glow-sm">
          {formatCycles(canister.cycleBalance ?? 0n)}
        </span>
      </td>

      {/* Status + Controller badge */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <StatusBadge
            status={canister.status}
            blinkDelay={getBlinkDelay(index - 1)}
          />
          <CtrlBadge isControlled={canister.isController} />
        </div>
      </td>

      {/* Last Checked */}
      <td className="px-3 py-2.5 whitespace-nowrap">
        <span className="font-mono text-[10px] text-muted-foreground">
          {canister.lastChecked > 0n
            ? formatTimestamp(canister.lastChecked)
            : "—"}
        </span>
      </td>

      {/* Delete */}
      <td className="px-3 py-2.5 text-right" data-no-navigate>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(canister);
          }}
          className={cn(
            "inline-flex items-center justify-center h-6 w-6 border border-transparent",
            "text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30",
            "transition-colors duration-100 opacity-0 group-hover:opacity-100",
          )}
          aria-label="Remove canister"
          data-ocid={`canister.delete_button.${index}`}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </td>
    </tr>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CanistersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CanisterSummary | null>(
    null,
  );
  const prevSearchRef = useRef(search);

  // Track last-known non-zero cycle balances so a transient backend 0 never
  // overwrites a previously displayed real value.
  const { updateAndGet: getGuardedBalance } = useSavedCycleBalances();

  const { data, isLoading } = useListCanisters(BigInt(page - 1));

  // Server-wide search — fetches all pages when a query is active.
  const isSearchActive = search.trim().length > 0;
  const { data: searchResults, isLoading: isSearchLoading } =
    useSearchCanisters(search);

  const rawItems = data?.items ?? [];
  const total = Number(data?.total ?? 0n);
  const pageSize = Number(data?.pageSize ?? 20n);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Apply cycle-balance guard: substitute last non-zero value whenever the
  // backend returns 0 due to a transient IC management call failure.
  const items = useMemo(
    () =>
      rawItems.map((c) => ({
        ...c,
        cycleBalance: getGuardedBalance(
          c.canisterId.toString(),
          c.cycleBalance,
        ),
      })),
    [rawItems, getGuardedBalance],
  );

  // When search is active, use search results; otherwise use paginated items.
  // Search results also get the cycle-balance guard applied.
  const guardedSearchResults = useMemo(
    () =>
      (searchResults ?? []).map((c) => ({
        ...c,
        cycleBalance: getGuardedBalance(
          c.canisterId.toString(),
          c.cycleBalance,
        ),
      })),
    [searchResults, getGuardedBalance],
  );

  const filtered = isSearchActive ? guardedSearchResults : items;

  const handleSearchChange = (value: string) => {
    if (value !== prevSearchRef.current) {
      prevSearchRef.current = value;
      setPage(1);
    }
    setSearch(value);
  };

  return (
    <div
      className="flex flex-col min-h-full font-mono"
      data-ocid="canisters.page"
    >
      {/* Page Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border/40 bg-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-mono text-[9px] text-primary/40 tracking-widest select-none mb-0.5">
              ┌─[ CANISTER REGISTRY ]
            </div>
            <h1 className="font-mono text-base font-bold text-primary tracking-[0.2em] uppercase retro-glow">
              &gt;_ CANISTERS
            </h1>
            <p className="font-mono text-[10px] text-muted-foreground mt-0.5 tracking-[0.12em]">
              {isLoading
                ? "LOADING…"
                : `${total} CANISTER${total !== 1 ? "S" : ""} TRACKED`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => setShowAddModal(true)}
              variant="outline"
              className="font-mono text-[10px] tracking-[0.2em] uppercase gap-1.5 shrink-0"
              data-ocid="canisters.add_button"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              [A] TRACK CANISTER
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="font-mono text-[10px] tracking-[0.2em] uppercase gap-1.5 shrink-0"
              data-ocid="canisters.create_button"
            >
              <Terminal className="h-3.5 w-3.5" />
              [C] CREATE CANISTER
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-3 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="SEARCH BY NAME OR CANISTER ID..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8 h-8 font-mono text-xs bg-background border-border/50 focus:border-primary uppercase placeholder:normal-case"
            data-ocid="canisters.search_input"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        {/* Search result count banner */}
        {isSearchActive && !isSearchLoading && (
          <div className="px-3 py-1.5 bg-primary/5 border-b border-primary/20 font-mono text-[10px] text-primary/70 tracking-[0.15em] uppercase">
            {(searchResults ?? []).length} RESULT
            {(searchResults ?? []).length !== 1 ? "S" : ""} FOR &ldquo;
            {search.trim()}&rdquo;
          </div>
        )}
        <table className="w-full min-w-[640px] text-xs">
          <thead>
            <tr className="border-b border-border/40 bg-muted/20">
              <th className="px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                CANISTER_NAME
              </th>
              <th className="px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                CANISTER_ID
              </th>
              <th className="px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                CYCLES
              </th>
              <th className="px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                STATUS
              </th>
              <th className="px-3 py-2 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                LAST_CHECKED
              </th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {/* Searching indicator — only while search is active and loading */}
            {isSearchActive && isSearchLoading ? (
              <tr>
                <td colSpan={6}>
                  <div
                    className="flex items-center justify-center gap-2 py-12 font-mono"
                    data-ocid="canisters.loading_state"
                  >
                    <span className="text-primary retro-glow animate-pulse text-xs tracking-[0.2em] uppercase">
                      [ SEARCHING ALL PAGES... ]
                    </span>
                  </div>
                </td>
              </tr>
            ) : !isSearchActive && isLoading ? (
              SKELETON_KEYS.map((k) => <SkeletonRow key={k} />)
            ) : filtered.length > 0 ? (
              filtered.map((canister, i) => (
                <CanisterRow
                  key={canister.canisterId.toString()}
                  canister={canister}
                  index={i + 1}
                  onDelete={setDeleteTarget}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  {isSearchActive ? (
                    <div
                      className="flex flex-col items-center justify-center py-14 text-center gap-3"
                      data-ocid="canisters.empty_state"
                    >
                      <Search className="h-8 w-8 text-muted-foreground/40" />
                      <div>
                        <p className="font-mono text-xs font-medium text-foreground uppercase tracking-[0.15em]">
                          NO_RESULTS: &ldquo;{search}&rdquo;
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground mt-1">
                          NO MATCH FOUND ACROSS ALL {total} CANISTER
                          {total !== 1 ? "S" : ""}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearchChange("")}
                        className="font-mono text-[10px] tracking-[0.2em] uppercase mt-1"
                      >
                        CLEAR SEARCH
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center py-16 text-center gap-4"
                      data-ocid="canisters.empty_state"
                    >
                      <div className="h-14 w-14 border border-primary/30 bg-primary/10 flex items-center justify-center retro-box-glow">
                        <Box className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-semibold text-foreground uppercase tracking-[0.2em]">
                          NO_CANISTERS_REGISTERED
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground mt-1 max-w-xs tracking-wider">
                          ADD A CANISTER ID TO MONITOR ITS CYCLE BALANCE AND
                          STATUS
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowAddModal(true)}
                        className="font-mono text-[10px] tracking-[0.2em] uppercase gap-1.5 mt-1"
                        data-ocid="canisters.empty_add_button"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        TRACK FIRST CANISTER
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination — hidden during search so results span all pages */}
      {!isLoading && total > 0 && !isSearchActive && (
        <div className="border-t border-border/40 px-4 py-2 bg-card/30">
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            data-ocid="canisters.pagination"
          />
        </div>
      )}

      {/* Modals */}
      <AddCanisterModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      <CreateCanisterModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <DeleteConfirmModal
        canister={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

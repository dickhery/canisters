import { CanisterStatus } from "@/backend.d";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: CanisterStatus;
  className?: string;
  /** Animation delay in seconds — offsets the blink phase per row */
  blinkDelay?: number;
}

const STATUS_CONFIG: Record<
  CanisterStatus,
  { label: string; dotClass: string; badgeClass: string; glowClass: string }
> = {
  [CanisterStatus.running]: {
    label: "ONLINE",
    dotClass: "bg-accent animate-blink",
    badgeClass: "border-accent/60 text-accent bg-accent/10",
    glowClass: "retro-glow-accent",
  },
  [CanisterStatus.stopped]: {
    label: "OFFLINE",
    dotClass: "bg-destructive",
    badgeClass: "border-destructive/60 text-destructive bg-destructive/10",
    glowClass: "",
  },
  [CanisterStatus.stopping]: {
    label: "HALTING",
    dotClass: "bg-primary animate-blink",
    badgeClass: "border-primary/60 text-primary bg-primary/10",
    glowClass: "retro-glow-sm",
  },
};

export function StatusBadge({
  status,
  className,
  blinkDelay,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG[CanisterStatus.stopped];

  // Only blinking statuses need the delay applied
  const needsDelay =
    status === CanisterStatus.running || status === CanisterStatus.stopping;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[10px] font-bold border tracking-[0.2em] uppercase",
        config.badgeClass,
        config.glowClass,
        className,
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 shrink-0", config.dotClass)}
        style={
          needsDelay && blinkDelay !== undefined
            ? { animationDelay: `${blinkDelay}s` }
            : undefined
        }
        aria-hidden="true"
      />
      [{config.label}]
    </span>
  );
}

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
  "data-ocid"?: string;
}

export function PaginationControls({
  page,
  totalPages,
  onPrev,
  onNext,
  className,
  "data-ocid": dataOcid,
}: PaginationControlsProps) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div
      data-ocid={dataOcid}
      className={cn(
        "flex items-center justify-between gap-3 px-2 py-1.5 font-mono",
        className,
      )}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={!canPrev}
        data-ocid={dataOcid ? `${dataOcid}.pagination_prev` : undefined}
        className="h-7 px-2 font-mono text-[10px] tracking-widest uppercase border-border/50 hover:border-primary/40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-3 w-3 mr-1" />
        [PREV]
      </Button>

      <span className="font-mono text-[10px] text-muted-foreground tabular-nums tracking-widest">
        PAGE <span className="text-foreground">{page}</span> /{" "}
        <span className="text-foreground">{totalPages}</span>
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!canNext}
        data-ocid={dataOcid ? `${dataOcid}.pagination_next` : undefined}
        className="h-7 px-2 font-mono text-[10px] tracking-widest uppercase border-border/50 hover:border-primary/40"
        aria-label="Next page"
      >
        [NEXT]
        <ChevronRight className="h-3 w-3 ml-1" />
      </Button>
    </div>
  );
}

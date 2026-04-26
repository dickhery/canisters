import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { copyToClipboard } from "@/lib/clipboard";
import { truncatePrincipal } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyableIdProps {
  id: string;
  label?: string;
  startChars?: number;
  endChars?: number;
  className?: string;
  "data-ocid"?: string;
}

export function CopyableId({
  id,
  label = "ID",
  startChars = 4,
  endChars = 4,
  className,
  "data-ocid": dataOcid,
}: CopyableIdProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(id, label);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncated = truncatePrincipal(id, startChars, endChars);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleCopy}
            data-ocid={dataOcid}
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1",
              "bg-muted/30 border border-border/50 hover:border-primary/40 hover:bg-muted/50",
              "transition-colors duration-150 cursor-pointer group font-mono",
              className,
            )}
          >
            <span className="font-mono text-xs text-foreground/80 group-hover:text-foreground transition-colors tabular-nums">
              {truncated}
            </span>
            <span className="text-muted-foreground group-hover:text-primary transition-colors shrink-0">
              {copied ? (
                <Check className="h-3 w-3 text-accent" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[320px] font-mono text-xs break-all"
        >
          {id}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

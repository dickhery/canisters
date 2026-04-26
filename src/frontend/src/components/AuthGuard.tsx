import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Loader2, ShieldCheck, Terminal } from "lucide-react";
import { useEffect, useState } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

const BOOT_LINES = [
  { id: "title", text: "CANISTERS CYCLE MANAGEMENT TERMINAL v1.0" },
  { id: "copy", text: "COPYRIGHT (C) 2024 CAFFEINE.AI" },
  { id: "blank1", text: "\u00A0" },
  { id: "init", text: "INITIALIZING SYSTEM..." },
  { id: "net", text: "CHECKING ICP NETWORK CONNECTION... OK" },
  { id: "reg", text: "LOADING CANISTER REGISTRY... OK" },
  { id: "auth", text: "AWAITING OPERATOR AUTHENTICATION" },
  { id: "blank2", text: "\u00A0" },
  { id: "cursor", text: "> _" },
];

function BootText() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines >= BOOT_LINES.length) return;
    const id = setTimeout(() => setVisibleLines((v) => v + 1), 150);
    return () => clearTimeout(id);
  }, [visibleLines]);

  return (
    <div className="font-mono text-[10px] text-muted-foreground space-y-0.5 text-left mb-6">
      {BOOT_LINES.slice(0, visibleLines).map(({ id, text }) => (
        <div
          key={id}
          className={
            text.startsWith(">") ? "text-primary retro-glow animate-blink" : ""
          }
        >
          {text}
        </div>
      ))}
    </div>
  );
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { identity, login, loginStatus } = useInternetIdentity();

  if (loginStatus === "logging-in") {
    return (
      <div className="min-h-screen bg-background scanline flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-3 border border-primary/30 bg-card p-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            AUTHENTICATING VIA INTERNET IDENTITY…
          </p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="min-h-screen bg-background scanline flex items-center justify-center p-6 font-mono">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 justify-center mb-8">
            <div className="flex h-10 w-10 items-center justify-center border border-primary/60 bg-primary/10">
              <Terminal className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="font-mono text-2xl font-bold tracking-widest text-primary retro-glow uppercase block">
                CANISTERS
              </span>
              <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
                CYCLE MANAGEMENT TERMINAL
              </span>
            </div>
          </div>

          {/* Card */}
          <div className="border border-primary/30 bg-card p-6">
            {/* Top border accent */}
            <div className="h-0.5 bg-primary retro-glow mb-5 -mx-6 -mt-6" />

            <BootText />

            <div className="border border-border/40 bg-muted/20 p-4 mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-primary/40 bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                  AUTHENTICATION REQUIRED
                </p>
                <p className="font-mono text-[10px] text-muted-foreground mt-0.5 tracking-wider">
                  SIGN IN WITH INTERNET IDENTITY TO PROCEED
                </p>
              </div>
            </div>

            <Button
              onClick={() => login()}
              size="lg"
              className="w-full font-mono font-bold tracking-widest uppercase text-xs border border-primary/60 hover:border-primary"
              data-ocid="auth.login_button"
            >
              [ENTER] SIGN IN WITH INTERNET IDENTITY
            </Button>

            <p className="mt-3 font-mono text-[10px] text-muted-foreground text-center tracking-wider">
              SECURED BY THE INTERNET COMPUTER'S NATIVE IDENTITY SYSTEM
            </p>
          </div>

          <p className="mt-5 text-center font-mono text-[10px] text-muted-foreground">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              BUILT WITH CAFFEINE.AI
            </a>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

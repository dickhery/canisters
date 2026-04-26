import { CopyableId } from "@/components/CopyableId";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/sonner";
import { truncatePrincipal } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Server,
  Terminal,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  ocid: string;
  shortKey: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    ocid: "nav.dashboard_link",
    shortKey: "D",
  },
  {
    label: "Canisters",
    href: "/canisters",
    icon: Server,
    ocid: "nav.canisters_link",
    shortKey: "C",
  },
  {
    label: "Account",
    href: "/account",
    icon: Wallet,
    ocid: "nav.account_link",
    shortKey: "A",
  },
];

interface LayoutProps {
  children: React.ReactNode;
}

function SysTime() {
  const [time, setTime] = useState(() =>
    new Date().toISOString().slice(0, 19).replace("T", " "),
  );
  useEffect(() => {
    const id = setInterval(
      () => setTime(new Date().toISOString().slice(0, 19).replace("T", " ")),
      1000,
    );
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time}</span>;
}

export function Layout({ children }: LayoutProps) {
  const { identity, clear } = useInternetIdentity();
  const routerState = useRouterState();
  const [mobileOpen, setMobileOpen] = useState(false);

  const principalText = identity?.getPrincipal().toText() ?? "";
  const shortPid = truncatePrincipal(principalText, 5, 5);

  const currentPathname = routerState.location.pathname;

  const isActive = (href: string) =>
    currentPathname === href ||
    (href !== "/dashboard" && currentPathname.startsWith(href));

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-0 font-mono" aria-label="Main navigation">
      {/* ASCII nav header */}
      <div className="px-2 py-1.5 text-[10px] text-muted-foreground tracking-[0.2em] mb-1">
        <span className="text-primary/50">┌─</span>
        <span className="mx-1">NAVIGATION</span>
        <span className="text-primary/50">─┐</span>
      </div>

      {NAV_ITEMS.map((item, idx) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        const isLast = idx === NAV_ITEMS.length - 1;
        return (
          <div key={item.href} className="relative">
            {/* ASCII tree line on left */}
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-primary/30 text-[10px] font-mono select-none">
              {isLast ? "└" : "├"}
            </span>
            <Link
              to={item.href}
              data-ocid={item.ocid}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 pl-6 pr-3 py-2 text-xs font-mono transition-colors duration-100 border-l-2",
                active
                  ? "border-l-primary bg-primary/10 text-primary retro-glow-sm"
                  : "border-l-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground hover:border-l-primary/30",
              )}
            >
              {/* > cursor for active item */}
              <span
                className={cn(
                  "text-[10px] w-3 shrink-0 font-bold",
                  active ? "text-primary" : "text-transparent",
                )}
              >
                &gt;
              </span>
              <Icon
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span className="tracking-[0.15em] uppercase text-[11px]">
                {item.label}
              </span>
              {active && (
                <span className="ml-auto text-primary text-xs animate-blink">
                  █
                </span>
              )}
            </Link>
          </div>
        );
      })}

      {/* ASCII nav footer */}
      <div className="px-2 py-1.5 text-[10px] text-muted-foreground tracking-[0.2em] mt-1">
        <span className="text-primary/50">└──────────────┘</span>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden scanline crt-flicker">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-sidebar">
        {/* Logo */}
        <div className="flex flex-col border-b border-border px-4 py-3">
          {/* Top corner bracket line */}
          <div className="font-mono text-[9px] text-primary/40 tracking-widest mb-1 select-none">
            ┌──────────────────────────────┐
          </div>
          <div className="flex items-center gap-2.5 mb-1 px-0.5">
            <div className="flex h-8 w-8 items-center justify-center border border-primary/60 bg-primary/10 retro-box-glow">
              <Terminal className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="font-mono text-lg font-bold tracking-[0.25em] text-primary retro-glow uppercase">
                CANISTERS
              </span>
            </div>
          </div>
          <div className="font-mono text-[10px] text-muted-foreground tracking-[0.15em] px-0.5">
            CYCLE MANAGEMENT TERMINAL
          </div>
          <div className="font-mono text-[10px] text-muted-foreground/50 mt-0.5 px-0.5">
            SYS_TIME: <SysTime />
          </div>
          <div className="font-mono text-[9px] text-primary/40 tracking-widest mt-1 select-none">
            └──────────────────────────────┘
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <NavLinks />
        </div>

        {/* System status */}
        <div className="border-t border-border/40 px-3 py-2">
          <div className="font-mono text-[10px] text-muted-foreground/60 tracking-[0.12em] flex items-center gap-1">
            <span>├─</span>
            <span>SYS_STATUS:</span>
            <span className="text-accent retro-glow-accent">[ONLINE]</span>
          </div>
          <div className="font-mono text-[10px] text-muted-foreground/60 tracking-[0.12em] flex items-center gap-1">
            <span>└─</span>
            <span>NET:</span>
            <span className="text-primary/70">ICP-MAINNET</span>
          </div>
        </div>

        {/* User menu */}
        <div className="border-t border-border p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                data-ocid="nav.user_menu_trigger"
                className="flex w-full items-center gap-2 px-2 py-2 border border-border/40 hover:border-primary/50 hover:bg-muted/40 transition-colors duration-150 text-left font-mono terminal-card"
              >
                <div className="flex h-7 w-7 items-center justify-center border border-primary/40 bg-primary/10 text-primary text-xs font-bold shrink-0">
                  {principalText.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground tracking-[0.15em]">
                    OPERATOR:
                  </p>
                  <p className="font-mono text-xs text-foreground truncate tracking-wide">
                    {shortPid}
                  </p>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="top"
              className="w-72 font-mono border-primary/30"
            >
              <div className="px-3 py-2">
                <p className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground mb-1 uppercase">
                  Principal ID
                </p>
                <CopyableId
                  id={principalText}
                  label="Principal ID"
                  startChars={6}
                  endChars={6}
                  data-ocid="nav.pid_copy_button"
                  className="w-full justify-between"
                />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => clear()}
                data-ocid="nav.logout_button"
                className="text-destructive focus:text-destructive cursor-pointer font-mono tracking-[0.12em] text-xs"
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                [X] SIGN OUT
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          role="button"
          tabIndex={0}
          className="fixed inset-0 z-40 bg-background/80 lg:hidden"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setMobileOpen(false);
          }}
          aria-label="Close sidebar"
        />
      )}

      {/* Mobile sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-border bg-sidebar transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center border border-primary/60 bg-primary/10 retro-box-glow">
              <Terminal className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-mono text-base font-bold tracking-[0.25em] text-primary retro-glow uppercase">
              CANISTERS
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 border border-transparent hover:border-border/40"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <NavLinks onNavigate={() => setMobileOpen(false)} />
        </div>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 px-2 py-1.5 border border-border/30 mb-2">
            <div className="flex h-7 w-7 items-center justify-center border border-primary/40 bg-primary/10 text-primary text-xs font-bold shrink-0">
              {principalText.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] text-muted-foreground tracking-[0.15em]">
                OPERATOR:
              </p>
              <p className="font-mono text-xs text-foreground truncate">
                {shortPid}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clear()}
            className="mt-1 w-full justify-start text-destructive hover:text-destructive font-mono text-xs tracking-[0.12em] border border-destructive/20 hover:border-destructive/40 hover:bg-destructive/10"
            data-ocid="nav.mobile_logout_button"
          >
            <LogOut className="h-3.5 w-3.5 mr-2" />
            [X] SIGN OUT
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="flex h-12 items-center gap-3 border-b border-border bg-sidebar px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            data-ocid="nav.mobile_menu_button"
            className="text-muted-foreground hover:text-foreground transition-colors p-1 border border-transparent hover:border-border/40"
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center border border-primary/60 bg-primary/10 retro-box-glow">
              <Terminal className="h-3 w-3 text-primary" />
            </div>
            <span className="font-mono text-sm font-bold tracking-[0.25em] text-primary retro-glow uppercase">
              CANISTERS
            </span>
          </div>
          <div className="ml-auto font-mono text-[10px] text-muted-foreground/60 hidden sm:block">
            <SysTime />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background pixel-grid">
          {children}
        </main>
      </div>

      <Toaster richColors position="bottom-right" />
    </div>
  );
}

import { type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  MessageCircle,
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
  CreditCard,
} from "lucide-react";
import { BrandLogo } from "~/components/brand-logo";
import { useAuth } from "~/modules/authentication";
import { apiRequest } from "~/lib/api.client";
import { cn } from "~/lib/utils";
import { initials } from "~/lib/domain";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  primary?: boolean; // appears in mobile bottom bar
}

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, primary: true },
  { to: "/leads", label: "Leads", icon: Users, primary: true },
  { to: "/appointments", label: "Appointments", icon: CalendarDays, primary: true },
  { to: "/messages", label: "Messages", icon: MessageCircle, primary: true },
  { to: "/automation", label: "Automation", icon: Sparkles },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/billing", label: "Billing", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(to + "/");
}

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  async function logout() {
    await apiRequest("/api/auth/logout", { method: "POST" });
    navigate("/auth/login");
  }

  const primary = NAV.filter((n) => n.primary);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center px-5">
          <BrandLogo />
        </div>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map((item) => {
            const active = isActive(location.pathname, item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/[0.08] text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: "#7C3F58" }}
            >
              {initials(user?.username || "Owner")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.username || "Owner"}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-danger"
              aria-label="Sign out"
            >
              <LogOut className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur md:hidden">
        <BrandLogo size="sm" />
        <button
          onClick={logout}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.6} />
        </button>
      </header>

      {/* Main content */}
      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 md:px-8 md:pb-12 md:pt-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav — 4 primary tabs + More */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {primary.map((item) => {
            const active = isActive(location.pathname, item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2 : 1.6} />
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/settings"
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
              isActive(location.pathname, "/settings") ||
                isActive(location.pathname, "/automation") ||
                isActive(location.pathname, "/reports") ||
                isActive(location.pathname, "/billing")
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            <Settings className="h-[22px] w-[22px]" strokeWidth={1.6} />
            More
          </Link>
        </div>
      </nav>
    </div>
  );
}

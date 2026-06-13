import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";
import {
  Users,
  CalendarCheck,
  CheckCircle2,
  UserX,
  DollarSign,
  ArrowRight,
  UserPlus,
  Download,
  Sparkles,
  MessageSquare,
  Star,
  TrendingUp,
  Activity as ActivityIcon,
} from "lucide-react";
import { RequireAuth } from "~/components/require-auth";
import { PageHeader } from "~/components/page-header";
import { MetricCard } from "~/components/metric-card";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/states";
import { useApi } from "~/lib/app.api";
import { useConfigurables } from "~/modules/configurables";
import { useAuth } from "~/modules/authentication";
import { formatCurrency, type DashboardMetrics } from "~/lib/domain";

export function meta() {
  return [{ title: "Dashboard — Radiance AI" }];
}

interface DashData {
  metrics: DashboardMetrics;
  activity: {
    _id: string;
    type: string;
    title: string;
    description: string;
    createdAt: string;
  }[];
}

const ACTIVITY_ICON: Record<string, typeof Users> = {
  lead_created: UserPlus,
  appointment_booked: CalendarCheck,
  message_sent: MessageSquare,
  review_requested: Star,
  status_changed: TrendingUp,
  reminder_sent: MessageSquare,
};

function DashboardContent() {
  const { config } = useConfigurables();
  const { user } = useAuth();
  const { data, loading } = useApi<DashData>("/api/app/dashboard");
  const symbol = config?.currencySymbol || "$";
  const showRevenue = config?.showRevenueMetric !== false;
  const firstName = (user?.username || "there").split(" ")[0];

  const m = data?.metrics;

  return (
    <>
      <PageHeader
        title={`Good to see you, ${firstName}`}
        subtitle="Here's how your AI front desk is performing this month."
      />

      {/* Metrics */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner className="h-7 w-7" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="Leads this month"
            value={String(m?.leadsThisMonth ?? 0)}
            icon={Users}
            trend={m?.leadsTrend}
          />
          <MetricCard
            label="Leads converted"
            value={String(m?.converted ?? 0)}
            icon={CheckCircle2}
            trend={m?.convertedTrend}
          />
          <MetricCard
            label="Confirmation rate"
            value={String(m?.confirmRate ?? 0)}
            suffix="%"
            icon={CalendarCheck}
            trend={m?.confirmRateTrend}
          />
          <MetricCard
            label="No-show rate"
            value={String(m?.noShowRate ?? 0)}
            suffix="%"
            icon={UserX}
            trend={m?.noShowRateTrend}
            invertTrend
          />
          {showRevenue && (
            <div className="col-span-2 lg:col-span-4">
              <div className="rounded-2xl border border-gold/30 bg-card p-5 card-soft">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-[#8a6f10]">
                      <DollarSign className="h-5 w-5" strokeWidth={1.7} />
                    </span>
                    <div>
                      <p className="text-[13px] text-muted-foreground">Revenue influenced by AI</p>
                      <p className="font-display text-3xl font-semibold tracking-tight text-foreground">
                        {formatCurrency(m?.revenue ?? 0, symbol)}
                      </p>
                    </div>
                  </div>
                  {typeof m?.revenueTrend === "number" && (
                    <span className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {m.revenueTrend >= 0 ? "+" : ""}
                      {m.revenueTrend}% vs last month
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <QuickAction to="/leads?new=1" icon={UserPlus} label="Add new lead" />
        <QuickAction to="/leads" icon={Users} label="View recent leads" />
        <QuickAction to="/reports" icon={Download} label="Export this month's data" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent activity */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <ActivityIcon className="h-[18px] w-[18px] text-primary" strokeWidth={1.7} />
              Recent activity
            </h2>
          </div>
          {loading ? (
            <div className="py-8 text-center">
              <Spinner className="mx-auto h-6 w-6" />
            </div>
          ) : data?.activity?.length ? (
            <ul className="space-y-1">
              {data.activity.map((a) => {
                const Icon = ACTIVITY_ICON[a.type] || ActivityIcon;
                return (
                  <li
                    key={a._id}
                    className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/60"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
                      <Icon className="h-4 w-4" strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{a.title}</p>
                      {a.description && (
                        <p className="truncate text-[13px] text-muted-foreground">{a.description}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Activity will appear here as leads come in and appointments are booked.
            </p>
          )}
        </Card>

        {/* Automation snapshot */}
        <Card className="p-5">
          <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-foreground">
            <Sparkles className="h-[18px] w-[18px] text-primary" strokeWidth={1.7} />
            Automation
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Your AI workflows are working around the clock.
          </p>
          <div className="mt-4 space-y-3">
            {[
              "Lead Follow-Up",
              "Appointment Reminder",
              "Re-Engagement",
              "Review Request",
            ].map((w) => (
              <div key={w} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{w}</span>
                <span className="h-2 w-2 rounded-full bg-success" />
              </div>
            ))}
          </div>
          <Button asChild variant="outline" className="mt-5 w-full">
            <Link to="/automation">
              Manage workflows
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </div>
    </>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof Users;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 card-soft transition-all hover:border-primary/30"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.08] text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" strokeWidth={1.7} />
      </span>
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function DashboardRoute() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}

import {
  Download,
  TrendingUp,
  Users,
  CalendarCheck,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { RequireAuth } from "~/components/require-auth";
import { PageHeader } from "~/components/page-header";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { MetricCard } from "~/components/metric-card";
import { PageLoader, EmptyState } from "~/components/states";
import {
  LeadsLineChart,
  ConversionBarChart,
  StatusDonutChart,
} from "~/components/charts";
import { useApi } from "~/lib/app.api";
import { formatCurrency, type DashboardMetrics } from "~/lib/domain";
import { useConfigurables } from "~/modules/configurables";

export function meta() {
  return [{ title: "Reports — Radiance AI" }];
}

interface ReportData {
  leadsOverTime: { date: string; leads: number }[];
  conversionByTreatment: { treatment: string; rate: number; total: number; converted: number }[];
  statusDistribution: { status: string; count: number }[];
  metrics: DashboardMetrics;
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ReportsContent() {
  const { data, loading } = useApi<ReportData>("/api/app/reports");
  const { config } = useConfigurables();
  const symbol = config?.currencySymbol || "$";

  if (loading) return <PageLoader />;
  if (!data) {
    return (
      <>
        <PageHeader title="Reports" />
        <EmptyState icon={BarChart3} title="No report data yet" description="Add leads and appointments to see your analytics." />
      </>
    );
  }

  const { leadsOverTime, conversionByTreatment, statusDistribution, metrics } = data;

  function exportConversion() {
    downloadCsv("conversion-by-treatment.csv", [
      ["Treatment", "Total leads", "Converted", "Conversion rate %"],
      ...conversionByTreatment.map((c) => [c.treatment, c.total, c.converted, c.rate]),
    ]);
  }
  function exportLeads() {
    downloadCsv("leads-over-time.csv", [
      ["Date", "New leads"],
      ...leadsOverTime.map((l) => [l.date, l.leads]),
    ]);
  }

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Track what's working across leads, bookings, and revenue."
        action={
          <Button size="sm" variant="outline" onClick={exportLeads} className="hidden sm:inline-flex">
            <Download className="h-4 w-4" /> Export
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Leads this month"
          value={String(metrics.leadsThisMonth)}
          icon={Users}
          trend={metrics.leadsTrend}
        />
        <MetricCard
          label="Converted"
          value={String(metrics.converted)}
          icon={TrendingUp}
          trend={metrics.convertedTrend}
        />
        <MetricCard
          label="Confirm rate"
          value={String(metrics.confirmRate)}
          suffix="%"
          icon={CalendarCheck}
          trend={metrics.confirmRateTrend}
        />
        <MetricCard
          label="Revenue influenced"
          value={formatCurrency(metrics.revenue, symbol)}
          icon={DollarSign}
          trend={metrics.revenueTrend}
          accent="gold"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">Leads over time</h2>
              <p className="text-xs text-muted-foreground">New leads captured, last 30 days</p>
            </div>
            <Button size="sm" variant="ghost" onClick={exportLeads}>
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>
          <LeadsLineChart data={leadsOverTime} />
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">Conversion by treatment</h2>
              <p className="text-xs text-muted-foreground">Share of leads that converted</p>
            </div>
            <Button size="sm" variant="ghost" onClick={exportConversion}>
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>
          {conversionByTreatment.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <ConversionBarChart data={conversionByTreatment} />
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold text-foreground">Appointment status</h2>
            <p className="text-xs text-muted-foreground">Distribution across all appointments</p>
          </div>
          {statusDistribution.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <StatusDonutChart data={statusDistribution} />
          )}
        </Card>
      </div>
    </>
  );
}

export default function ReportsRoute() {
  return (
    <RequireAuth>
      <ReportsContent />
    </RequireAuth>
  );
}

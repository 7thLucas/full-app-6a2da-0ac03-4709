import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { format } from "date-fns";
import { Plus, Upload, Download, Search, Users, ChevronRight } from "lucide-react";
import { RequireAuth } from "~/components/require-auth";
import { PageHeader } from "~/components/page-header";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { EmptyState, SkeletonRow } from "~/components/states";
import { LeadFormDialog } from "~/components/lead-form-dialog";
import { ImportLeadsDialog } from "~/components/import-leads-dialog";
import { useApi } from "~/lib/app.api";
import {
  LEAD_STATUSES,
  leadStatusVariant,
  formatCurrency,
  initials,
  avatarTint,
  type Lead,
} from "~/lib/domain";
import { useConfigurables } from "~/modules/configurables";
import { cn } from "~/lib/utils";

export function meta() {
  return [{ title: "Leads — Radiance AI" }];
}

function exportCsv(leads: Lead[]) {
  const headers = ["name", "email", "phone", "source", "treatment", "status", "estimatedValue", "createdAt"];
  const rows = leads.map((l) =>
    headers
      .map((h) => {
        const v = (l as any)[h] ?? "";
        return `"${String(v).replace(/"/g, '""')}"`;
      })
      .join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function LeadsContent() {
  const { config } = useConfigurables();
  const symbol = config?.currencySymbol || "$";
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(params.get("new") === "1");
  const [importOpen, setImportOpen] = useState(false);

  const { data, loading, refetch } = useApi<Lead[]>("/api/app/leads", { status }, [status]);

  useEffect(() => {
    if (params.get("new") === "1") {
      setParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const list = data ?? [];
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q),
    );
  }, [data, query]);

  const counts = useMemo(() => {
    const list = data ?? [];
    const c: Record<string, number> = {};
    list.forEach((l) => (c[l.status] = (c[l.status] || 0) + 1));
    return c;
  }, [data]);

  return (
    <>
      <PageHeader
        title="Leads"
        subtitle="Track every prospect from first touch to converted."
        action={
          <div className="hidden gap-2 sm:flex">
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4" /> Import
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportCsv(filtered)}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New lead
            </Button>
          </div>
        }
      />

      {/* Mobile actions */}
      <div className="mb-4 flex gap-2 sm:hidden">
        <Button size="sm" className="flex-1" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> New lead
        </Button>
        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
          <Upload className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportCsv(filtered)}>
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or phone"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status filter chips */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {["All", ...LEAD_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
              status === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40",
            )}
          >
            {s}
            {s !== "All" && counts[s] ? (
              <span className="ml-1.5 opacity-70">{counts[s]}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads yet"
          description="New leads captured by your AI workflows will show up here. Add one manually to get started."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Add your first lead
            </Button>
          }
        />
      ) : (
        <Card className="divide-y divide-border overflow-hidden p-0">
          {filtered.map((lead) => (
            <Link
              key={lead._id}
              to={`/leads/${lead._id}`}
              className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: avatarTint(lead.name) }}
              >
                {initials(lead.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{lead.name}</p>
                <p className="truncate text-[13px] text-muted-foreground">
                  {lead.treatment || "—"} · {lead.source}
                </p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-foreground">
                  {formatCurrency(lead.estimatedValue, symbol)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(lead.createdAt), "MMM d")}
                </p>
              </div>
              <Badge variant={leadStatusVariant(lead.status)}>{lead.status}</Badge>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </Card>
      )}

      <LeadFormDialog open={createOpen} onOpenChange={setCreateOpen} onSaved={refetch} />
      <ImportLeadsDialog open={importOpen} onOpenChange={setImportOpen} onImported={refetch} />
    </>
  );
}

export default function LeadsRoute() {
  return (
    <RequireAuth>
      <LeadsContent />
    </RequireAuth>
  );
}

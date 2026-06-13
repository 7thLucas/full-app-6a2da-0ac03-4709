import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { format } from "date-fns";
import {
  ArrowLeft,
  Phone,
  Mail,
  Pencil,
  Trash2,
  MessageSquare,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { RequireAuth } from "~/components/require-auth";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { PageLoader } from "~/components/states";
import { LeadFormDialog } from "~/components/lead-form-dialog";
import { api, useApi } from "~/lib/app.api";
import {
  leadStatusVariant,
  apptStatusVariant,
  formatCurrency,
  initials,
  avatarTint,
  type Lead,
  type Message,
  type Appointment,
} from "~/lib/domain";
import { useConfigurables } from "~/modules/configurables";

export function meta() {
  return [{ title: "Lead — Radiance AI" }];
}

interface LeadDetail {
  lead: Lead;
  messages: Message[];
  appointments: Appointment[];
}

function LeadDetailContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { config } = useConfigurables();
  const symbol = config?.currencySymbol || "$";
  const { data, loading, refetch } = useApi<LeadDetail>(`/api/app/leads/${id}`);
  const [editOpen, setEditOpen] = useState(false);

  if (loading) return <PageLoader />;
  if (!data?.lead) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Lead not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/leads">Back to leads</Link>
        </Button>
      </div>
    );
  }

  const { lead, messages, appointments } = data;

  async function changeStatus(status: string) {
    await api.patch(`/api/app/leads/${id}`, { status });
    refetch();
  }

  async function remove() {
    if (!confirm("Delete this lead? This cannot be undone.")) return;
    await api.del(`/api/app/leads/${id}`);
    navigate("/leads");
  }

  return (
    <>
      <Link
        to="/leads"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All leads
      </Link>

      {/* Header card */}
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-white"
            style={{ backgroundColor: avatarTint(lead.name) }}
          >
            {initials(lead.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-foreground">{lead.name}</h1>
              <Badge variant={leadStatusVariant(lead.status)}>{lead.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {lead.treatment || "—"} · {lead.source} · {formatCurrency(lead.estimatedValue, symbol)} est.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-[13px] text-foreground"
                >
                  <Phone className="h-3.5 w-3.5" /> {lead.phone}
                </a>
              )}
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-[13px] text-foreground"
                >
                  <Mail className="h-3.5 w-3.5" /> {lead.email}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          {lead.status !== "Booked" && (
            <Button size="sm" variant="outline" onClick={() => changeStatus("Booked")}>
              <CalendarDays className="h-4 w-4" /> Mark booked
            </Button>
          )}
          {lead.status !== "Converted" && (
            <Button size="sm" onClick={() => changeStatus("Converted")}>
              <CheckCircle2 className="h-4 w-4" /> Mark converted
            </Button>
          )}
          <Button size="sm" variant="outline" asChild>
            <Link to={`/messages/${lead._id}`}>
              <MessageSquare className="h-4 w-4" /> Message
            </Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-danger hover:text-danger"
            onClick={remove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Notes */}
        {lead.notes && (
          <Card className="p-5 lg:col-span-2">
            <h2 className="mb-2 text-sm font-semibold text-foreground">Notes</h2>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{lead.notes}</p>
          </Card>
        )}

        {/* Appointments */}
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Appointment history</h2>
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No appointments yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {appointments.map((a) => (
                <li key={a._id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.treatment}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(a.startAt), "MMM d, yyyy · h:mm a")}
                    </p>
                  </div>
                  <Badge variant={apptStatusVariant(a.status)}>{a.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Messages */}
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Recent messages</h2>
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {messages.slice(-5).map((m) => (
                <li key={m._id} className="text-sm">
                  <p className="text-foreground">{m.body}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {m.direction === "outbound" ? "Sent" : "Received"} ·{" "}
                    {m.channel.toUpperCase()} · {format(new Date(m.createdAt), "MMM d, h:mm a")}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="outline" size="sm" className="mt-4 w-full">
            <Link to={`/messages/${lead._id}`}>Open conversation</Link>
          </Button>
        </Card>
      </div>

      <LeadFormDialog open={editOpen} onOpenChange={setEditOpen} onSaved={refetch} lead={lead} />
    </>
  );
}

export default function LeadDetailRoute() {
  return (
    <RequireAuth>
      <LeadDetailContent />
    </RequireAuth>
  );
}

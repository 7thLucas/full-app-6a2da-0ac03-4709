import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Phone,
  Bell,
  Check,
  X,
  Pencil,
  UserX,
} from "lucide-react";
import { RequireAuth } from "~/components/require-auth";
import { PageHeader } from "~/components/page-header";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { EmptyState, Spinner } from "~/components/states";
import { AppointmentFormDialog } from "~/components/appointment-form-dialog";
import { api, useApi } from "~/lib/app.api";
import { apptStatusVariant, type Appointment } from "~/lib/domain";
import { cn } from "~/lib/utils";

export function meta() {
  return [{ title: "Appointments — Radiance AI" }];
}

function AppointmentsContent() {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [detail, setDetail] = useState<Appointment | null>(null);

  const { data, loading, refetch } = useApi<Appointment[]>("/api/app/appointments");
  const appts = data ?? [];

  const grid = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const byDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    appts.forEach((a) => {
      const k = format(new Date(a.startAt), "yyyy-MM-dd");
      (map[k] = map[k] || []).push(a);
    });
    return map;
  }, [appts]);

  const dayAppts = (byDay[format(selectedDay, "yyyy-MM-dd")] || []).sort(
    (a, b) => +new Date(a.startAt) - +new Date(b.startAt),
  );

  const upcoming = useMemo(
    () =>
      [...appts]
        .filter((a) => new Date(a.startAt) >= new Date(new Date().setHours(0, 0, 0, 0)))
        .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt)),
    [appts],
  );

  async function setStatus(a: Appointment, status: string) {
    await api.patch(`/api/app/appointments/${a._id}`, { status });
    setDetail(null);
    refetch();
  }
  async function sendReminder(a: Appointment) {
    await api.post(`/api/app/appointments/${a._id}/reminder`);
    setDetail(null);
    refetch();
  }

  return (
    <>
      <PageHeader
        title="Appointments"
        subtitle="Confirm, reschedule, and keep no-shows in check."
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)} className="hidden sm:inline-flex">
            <Plus className="h-4 w-4" /> New
          </Button>
        }
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <Tabs value={view} onValueChange={(v) => setView(v as any)}>
          <TabsList>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="sm:hidden">
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner className="h-7 w-7" />
        </div>
      ) : view === "calendar" ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="p-4 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">
                {format(month, "MMMM yyyy")}
              </h2>
              <div className="flex gap-1">
                <button
                  onClick={() => setMonth(subMonths(month, 1))}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setMonth(new Date())}
                  className="rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  Today
                </button>
                <button
                  onClick={() => setMonth(addMonths(month, 1))}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} className="py-1.5">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {grid.map((day) => {
                const k = format(day, "yyyy-MM-dd");
                const count = byDay[k]?.length ?? 0;
                const selected = isSameDay(day, selectedDay);
                const outside = !isSameMonth(day, month);
                return (
                  <button
                    key={k}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors",
                      selected
                        ? "bg-primary text-primary-foreground"
                        : isToday(day)
                          ? "bg-primary/[0.08] text-primary"
                          : "hover:bg-muted",
                      outside && !selected && "text-muted-foreground/40",
                    )}
                  >
                    {format(day, "d")}
                    {count > 0 && (
                      <span
                        className={cn(
                          "absolute bottom-1.5 h-1.5 w-1.5 rounded-full",
                          selected ? "bg-primary-foreground" : "bg-gold",
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Day detail */}
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              {format(selectedDay, "EEEE, MMM d")}
            </h3>
            {dayAppts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing scheduled.
              </p>
            ) : (
              <ul className="space-y-2">
                {dayAppts.map((a) => (
                  <li key={a._id}>
                    <button
                      onClick={() => setDetail(a)}
                      className="w-full rounded-xl border border-border p-3 text-left transition-colors hover:border-primary/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {format(new Date(a.startAt), "h:mm a")}
                        </span>
                        <Badge variant={apptStatusVariant(a.status)}>{a.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-foreground">{a.patientName}</p>
                      <p className="text-xs text-muted-foreground">{a.treatment}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : upcoming.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No upcoming appointments"
          description="Booked appointments will appear here. Create one manually any time."
          action={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> New appointment</Button>}
        />
      ) : (
        <Card className="divide-y divide-border p-0">
          {upcoming.map((a) => (
            <button
              key={a._id}
              onClick={() => setDetail(a)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-muted py-1.5">
                <span className="text-[11px] font-medium uppercase text-muted-foreground">
                  {format(new Date(a.startAt), "MMM")}
                </span>
                <span className="font-display text-lg font-semibold text-foreground">
                  {format(new Date(a.startAt), "d")}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{a.patientName}</p>
                <p className="truncate text-[13px] text-muted-foreground">
                  {format(new Date(a.startAt), "h:mm a")} · {a.treatment}
                </p>
              </div>
              <Badge variant={apptStatusVariant(a.status)}>{a.status}</Badge>
            </button>
          ))}
        </Card>
      )}

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent>
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>{detail.patientName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {format(new Date(detail.startAt), "EEEE, MMM d · h:mm a")} ({detail.durationMinutes} min)
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{detail.treatment}</span>
                  <Badge variant={apptStatusVariant(detail.status)}>{detail.status}</Badge>
                </div>
                {detail.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" /> {detail.phone}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setStatus(detail, "Confirmed")}>
                  <Check className="h-4 w-4" /> Confirm
                </Button>
                <Button size="sm" variant="outline" onClick={() => sendReminder(detail)}>
                  <Bell className="h-4 w-4" /> Remind
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(detail);
                    setDetail(null);
                  }}
                >
                  <Pencil className="h-4 w-4" /> Reschedule
                </Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(detail, "No-Show")}>
                  <UserX className="h-4 w-4" /> No-show
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="col-span-2 text-danger hover:text-danger"
                  onClick={() => setStatus(detail, "Cancelled")}
                >
                  <X className="h-4 w-4" /> Cancel appointment
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AppointmentFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={refetch}
        defaultDate={selectedDay}
      />
      <AppointmentFormDialog
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        onSaved={refetch}
        appointment={editing}
      />
    </>
  );
}

export default function AppointmentsRoute() {
  return (
    <RequireAuth>
      <AppointmentsContent />
    </RequireAuth>
  );
}

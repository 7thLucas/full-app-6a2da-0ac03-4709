import { useEffect, useState } from "react";
import { format } from "date-fns";
import { api } from "~/lib/app.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { APPT_STATUSES, TREATMENTS, type Appointment } from "~/lib/domain";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
  appointment?: Appointment | null;
  defaultDate?: Date;
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  onSaved,
  appointment,
  defaultDate,
}: Props) {
  const [form, setForm] = useState({
    patientName: "",
    phone: "",
    email: "",
    treatment: "Botox",
    date: "",
    time: "10:00",
    durationMinutes: "60",
    status: "Pending",
    value: "0",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const base = appointment ? new Date(appointment.startAt) : defaultDate ?? new Date();
    setForm({
      patientName: appointment?.patientName ?? "",
      phone: appointment?.phone ?? "",
      email: appointment?.email ?? "",
      treatment: appointment?.treatment ?? "Botox",
      date: format(base, "yyyy-MM-dd"),
      time: appointment ? format(base, "HH:mm") : "10:00",
      durationMinutes: String(appointment?.durationMinutes ?? 60),
      status: appointment?.status ?? "Pending",
      value: String(appointment?.value ?? 0),
      notes: appointment?.notes ?? "",
    });
  }, [open, appointment, defaultDate]);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    if (!form.patientName.trim() || !form.date) return;
    setSaving(true);
    const startAt = new Date(`${form.date}T${form.time}`).toISOString();
    const payload = {
      patientName: form.patientName,
      phone: form.phone,
      email: form.email,
      treatment: form.treatment,
      startAt,
      durationMinutes: Number(form.durationMinutes) || 60,
      status: form.status,
      value: Number(form.value) || 0,
      notes: form.notes,
    };
    if (appointment) await api.patch(`/api/app/appointments/${appointment._id}`, payload);
    else await api.post("/api/app/appointments", payload);
    setSaving(false);
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{appointment ? "Edit appointment" : "New appointment"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <Label>Patient name</Label>
            <Input value={form.patientName} onChange={(e) => set("patientName", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Value</Label>
              <Input type="number" value={form.value} onChange={(e) => set("value", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Treatment</Label>
            <Select value={form.treatment} onValueChange={(v) => set("treatment", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TREATMENTS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Duration (min)</Label>
              <Input
                type="number"
                value={form.durationMinutes}
                onChange={(e) => set("durationMinutes", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {APPT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.patientName.trim()}>
            {saving ? "Saving…" : appointment ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

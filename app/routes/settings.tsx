import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Plug,
  Check,
  UserPlus,
  Crown,
  Mail,
} from "lucide-react";
import { RequireAuth } from "~/components/require-auth";
import { PageHeader } from "~/components/page-header";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { PageLoader } from "~/components/states";
import { api, useApi } from "~/lib/app.api";
import { useAuth } from "~/modules/authentication";
import { initials, avatarTint, type Organization } from "~/lib/domain";

export function meta() {
  return [{ title: "Settings — Radiance AI" }];
}

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Europe/London",
];

interface StaffMember {
  id: string;
  username: string;
  email: string;
  role: string;
}

function OrgProfileTab() {
  const { data, loading, refetch } = useApi<Organization>("/api/app/org");
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    timezone: "America/New_York",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name || "",
        address: data.address || "",
        phone: data.phone || "",
        timezone: data.timezone || "America/New_York",
      });
    }
  }, [data]);

  if (loading) return <PageLoader />;

  async function save() {
    setSaving(true);
    await api.patch("/api/app/org", form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    refetch();
  }

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <Card className="p-5">
      <h2 className="mb-4 font-display text-base font-semibold text-foreground">
        Practice profile
      </h2>
      <div className="space-y-3.5">
        <div className="space-y-1.5">
          <Label>Practice name</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Address</Label>
          <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Timezone</Label>
            <Select value={form.timezone} onValueChange={(v) => set("timezone", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saved ? <><Check className="h-4 w-4" /> Saved</> : saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </Card>
  );
}

function StaffTab() {
  const { data, loading, refetch } = useApi<StaffMember[]>("/api/app/staff");
  const { user } = useAuth();
  const staff = data ?? [];
  const isOwner = staff.find((s) => s.role === "owner")?.email === user?.email;
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({ username: "", email: "" });
  const [inviting, setInviting] = useState(false);

  async function sendInvite() {
    if (!invite.email.trim()) return;
    setInviting(true);
    await api.post("/api/app/staff/invite", invite);
    setInviting(false);
    setInvite({ username: "", email: "" });
    setInviteOpen(false);
    refetch();
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-foreground">Team</h2>
        {isOwner && (
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4" /> Invite
          </Button>
        )}
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <ul className="divide-y divide-border">
          {staff.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: avatarTint(m.username || m.email) }}
              >
                {initials(m.username || m.email)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{m.username || m.email}</p>
                <p className="truncate text-xs text-muted-foreground">{m.email}</p>
              </div>
              <Badge variant={m.role === "owner" ? "plum" : "default"}>
                {m.role === "owner" ? (
                  <><Crown className="h-3 w-3" /> Owner</>
                ) : (
                  "Staff"
                )}
              </Badge>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a team member</DialogTitle>
          </DialogHeader>
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={invite.username}
                onChange={(e) => setInvite((i) => ({ ...i, username: e.target.value }))}
                placeholder="Jamie Rivera"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={invite.email}
                onChange={(e) => setInvite((i) => ({ ...i, email: e.target.value }))}
                placeholder="jamie@example.com"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              They'll get staff access with a temporary password to reset on first sign-in.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={sendInvite} disabled={inviting || !invite.email.trim()}>
              {inviting ? "Sending…" : "Send invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function IntegrationsTab() {
  const { data, loading, refetch } = useApi<Organization>("/api/app/org");
  const [form, setForm] = useState({
    n8nBaseUrl: "",
    smsFromNumber: "",
    emailFromName: "",
    bookingUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data?.integrations) {
      setForm({
        n8nBaseUrl: data.integrations.n8nBaseUrl || "",
        smsFromNumber: data.integrations.smsFromNumber || "",
        emailFromName: data.integrations.emailFromName || "",
        bookingUrl: data.integrations.bookingUrl || "",
      });
    }
  }, [data]);

  if (loading) return <PageLoader />;

  async function save() {
    setSaving(true);
    await api.patch("/api/app/org", {
      integrations: { ...(data?.integrations ?? {}), ...form },
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    refetch();
  }

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <Card className="p-5">
      <h2 className="mb-1 font-display text-base font-semibold text-foreground">
        Integrations
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Connect your n8n instance and messaging providers.
      </p>
      <div className="space-y-3.5">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5">
            <Plug className="h-3.5 w-3.5" /> n8n base URL
          </Label>
          <Input
            value={form.n8nBaseUrl}
            onChange={(e) => set("n8nBaseUrl", e.target.value)}
            placeholder="https://your-n8n.app"
          />
          <p className="text-xs text-muted-foreground">
            Per-workflow webhook paths are configured on the Automation page.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>SMS from number</Label>
            <Input
              value={form.smsFromNumber}
              onChange={(e) => set("smsFromNumber", e.target.value)}
              placeholder="+1 512 555 0100"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email from name
            </Label>
            <Input
              value={form.emailFromName}
              onChange={(e) => set("emailFromName", e.target.value)}
              placeholder="Luminous Med Spa"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Online booking URL</Label>
          <Input
            value={form.bookingUrl}
            onChange={(e) => set("bookingUrl", e.target.value)}
            placeholder="https://book.yourspa.com"
          />
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saved ? <><Check className="h-4 w-4" /> Saved</> : saving ? "Saving…" : "Save integrations"}
        </Button>
      </div>
    </Card>
  );
}

function SettingsContent() {
  const [tab, setTab] = useState("profile");

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your practice, team, and integrations."
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="profile">
            <Building2 className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4" /> Team
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Plug className="h-4 w-4" /> Integrations
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "profile" && <OrgProfileTab />}
      {tab === "team" && <StaffTab />}
      {tab === "integrations" && <IntegrationsTab />}
    </>
  );
}

export default function SettingsRoute() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  );
}

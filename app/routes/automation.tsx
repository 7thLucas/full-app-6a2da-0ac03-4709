import { useEffect, useState } from "react";
import {
  Sparkles,
  Clock,
  MessageSquareReply,
  RefreshCw,
  Star,
  Webhook,
  Check,
} from "lucide-react";
import { RequireAuth } from "~/components/require-auth";
import { PageHeader } from "~/components/page-header";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { PageLoader } from "~/components/states";
import { api, useApi } from "~/lib/app.api";
import { cn } from "~/lib/utils";
import type { Workflow } from "~/lib/domain";

export function meta() {
  return [{ title: "Automation — Radiance AI" }];
}

const WORKFLOW_META: Record<
  string,
  { icon: typeof Sparkles; blurb: string }
> = {
  lead_follow_up: {
    icon: MessageSquareReply,
    blurb: "Instantly reply to new leads and keep nudging until they book.",
  },
  appointment_reminder: {
    icon: Clock,
    blurb: "Send timed reminders before each appointment to cut no-shows.",
  },
  re_engagement: {
    icon: RefreshCw,
    blurb: "Win back quiet patients who haven't visited in a while.",
  },
  review_request: {
    icon: Star,
    blurb: "Ask happy patients for a review right after their visit.",
  },
};

function WorkflowCard({
  wf,
  onChange,
}: {
  wf: Workflow;
  onChange: () => void;
}) {
  const meta = WORKFLOW_META[wf.key] ?? { icon: Sparkles, blurb: "" };
  const Icon = meta.icon;
  const [enabled, setEnabled] = useState(wf.enabled);
  const [webhookUrl, setWebhookUrl] = useState(wf.webhookUrl || "");
  const [smsTemplate, setSmsTemplate] = useState(wf.smsTemplate || "");
  const [emailTemplate, setEmailTemplate] = useState(wf.emailTemplate || "");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setEnabled(wf.enabled);
    setWebhookUrl(wf.webhookUrl || "");
    setSmsTemplate(wf.smsTemplate || "");
    setEmailTemplate(wf.emailTemplate || "");
  }, [wf]);

  async function toggle(v: boolean) {
    setEnabled(v);
    await api.patch(`/api/app/workflows/${wf._id}`, { enabled: v });
    onChange();
  }

  async function save() {
    setSaving(true);
    await api.patch(`/api/app/workflows/${wf._id}`, {
      webhookUrl,
      smsTemplate,
      emailTemplate,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onChange();
  }

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors",
            enabled ? "bg-primary/[0.1] text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.6} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-semibold text-foreground">{wf.name}</h3>
            <Badge variant={enabled ? "success" : "default"}>
              {enabled ? "Active" : "Paused"}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{meta.blurb}</p>
        </div>
        <Switch checked={enabled} onCheckedChange={toggle} />
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-3 text-[13px] font-medium text-primary hover:underline"
      >
        {open ? "Hide configuration" : "Configure templates & webhook"}
      </button>

      {open && (
        <div className="mt-4 space-y-3.5 border-t border-border pt-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Webhook className="h-3.5 w-3.5" /> n8n webhook URL
            </Label>
            <Input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-n8n.app/webhook/…"
            />
          </div>
          <div className="space-y-1.5">
            <Label>SMS template</Label>
            <Textarea
              value={smsTemplate}
              onChange={(e) => setSmsTemplate(e.target.value)}
              placeholder="Hi {{name}}, …"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email template</Label>
            <Textarea
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              placeholder="Hi {{name}}, …"
              rows={4}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Use placeholders like <code className="rounded bg-muted px-1 py-0.5">{"{{name}}"}</code>,{" "}
            <code className="rounded bg-muted px-1 py-0.5">{"{{treatment}}"}</code>, and{" "}
            <code className="rounded bg-muted px-1 py-0.5">{"{{date}}"}</code>.
          </p>
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving} size="sm">
              {saved ? (
                <>
                  <Check className="h-4 w-4" /> Saved
                </>
              ) : saving ? (
                "Saving…"
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function AutomationContent() {
  const { data, loading, refetch } = useApi<Workflow[]>("/api/app/workflows");
  const workflows = data ?? [];
  const activeCount = workflows.filter((w) => w.enabled).length;

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader
        title="AI Automation"
        subtitle="Your always-on assistant for follow-ups, reminders, and reviews."
      />

      <Card className="mb-4 flex items-center gap-3 bg-primary/[0.04] p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {activeCount} of {workflows.length} automations active
          </p>
          <p className="text-xs text-muted-foreground">
            Toggle a workflow on to let the AI handle it automatically.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {workflows.map((wf) => (
          <WorkflowCard key={wf._id} wf={wf} onChange={refetch} />
        ))}
      </div>
    </>
  );
}

export default function AutomationRoute() {
  return (
    <RequireAuth>
      <AutomationContent />
    </RequireAuth>
  );
}

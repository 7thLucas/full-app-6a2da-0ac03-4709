import { useState } from "react";
import { Check, Sparkles, CreditCard } from "lucide-react";
import { RequireAuth } from "~/components/require-auth";
import { PageHeader } from "~/components/page-header";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { PageLoader } from "~/components/states";
import { api, useApi } from "~/lib/app.api";
import { useConfigurables } from "~/modules/configurables";
import { cn } from "~/lib/utils";
import type { Organization } from "~/lib/domain";

export function meta() {
  return [{ title: "Billing — Radiance AI" }];
}

const PLAN_FEATURES: Record<string, string[]> = {
  Starter: [
    "Up to 500 leads / month",
    "Lead follow-up automation",
    "Appointment reminders",
    "Email support",
  ],
  Growth: [
    "Up to 2,000 leads / month",
    "All Starter automations",
    "Re-engagement campaigns",
    "Review requests",
    "Priority support",
  ],
  Pro: [
    "Unlimited leads",
    "All Growth automations",
    "Multi-provider scheduling",
    "Custom n8n workflows",
    "Dedicated success manager",
  ],
};

function BillingContent() {
  const { data, loading, refetch } = useApi<Organization>("/api/app/org");
  const { config } = useConfigurables();
  const plans = config?.plans ?? [];
  const [switching, setSwitching] = useState<string | null>(null);

  if (loading) return <PageLoader />;

  const currentPlan = data?.plan || "Starter";

  async function choosePlan(name: string) {
    if (name === currentPlan) return;
    setSwitching(name);
    await api.patch("/api/app/org", { plan: name });
    setSwitching(null);
    refetch();
  }

  return (
    <>
      <PageHeader
        title="Billing & Plan"
        subtitle="Choose the plan that fits your practice. Change anytime."
      />

      <Card className="mb-5 flex items-center gap-4 bg-primary/[0.04] p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CreditCard className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Current plan
          </p>
          <p className="font-display text-lg font-semibold text-foreground">{currentPlan}</p>
        </div>
        <Badge variant="success">Active</Badge>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.name === currentPlan;
          const featured = plan.name === "Growth";
          const features = PLAN_FEATURES[plan.name] ?? [];
          return (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col p-5",
                featured && "border-primary/40 ring-1 ring-primary/20",
              )}
            >
              {featured && (
                <span className="absolute -top-2.5 left-5 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                  <Sparkles className="h-3 w-3" /> Most popular
                </span>
              )}
              <h3 className="font-display text-lg font-semibold text-foreground">{plan.name}</h3>
              <p className="mt-1 font-display text-2xl font-semibold text-foreground">
                {plan.price}
              </p>
              {plan.description && (
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              )}
              <ul className="mt-4 flex-1 space-y-2">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => choosePlan(plan.name)}
                disabled={isCurrent || switching === plan.name}
                variant={isCurrent ? "secondary" : featured ? "default" : "outline"}
                className="mt-5 w-full"
              >
                {isCurrent
                  ? "Current plan"
                  : switching === plan.name
                    ? "Switching…"
                    : `Switch to ${plan.name}`}
              </Button>
            </Card>
          );
        })}
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Plans are managed by your Radiance AI account team. Switching takes effect immediately.
      </p>
    </>
  );
}

export default function BillingRoute() {
  return (
    <RequireAuth>
      <BillingContent />
    </RequireAuth>
  );
}

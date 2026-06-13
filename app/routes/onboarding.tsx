import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/modules/authentication";
import { api } from "~/lib/app.api";
import { AuthLayout } from "~/components/auth-layout";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { Organization } from "~/lib/domain";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
];

export function meta() {
  return [{ title: "Set up your med spa — Radiance AI" }];
}

export default function OnboardingRoute() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth/login", { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    // Pre-fill from any auto-provisioned org
    api.get<Organization>("/api/app/org").then((org) => {
      if (org) {
        setName(org.name || "");
        setAddress(org.address || "");
        setPhone(org.phone || "");
        setTimezone(org.timezone || "America/New_York");
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await api.patch("/api/app/org", { name, address, phone, timezone });
    setSubmitting(false);
    navigate("/dashboard");
  }

  return (
    <AuthLayout
      title="Set up your med spa"
      description="A few details so we can tailor your dashboard."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Med spa name</Label>
          <Input
            id="name"
            required
            placeholder="Luminous Med Spa"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="120 Rosewood Ave, Austin, TX"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            placeholder="(512) 555-0188"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz.replace("America/", "").replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Saving…" : "Enter dashboard"}
        </Button>
      </form>
    </AuthLayout>
  );
}

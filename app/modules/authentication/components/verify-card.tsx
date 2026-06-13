import { useState } from "react";
import { apiRequest } from "~/lib/api.client";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

/**
 * VerifyCard — posts a 6-digit code to POST /api/auth/verify-email.
 * Optional flow; requires SMTP configured for code delivery.
 */
export function VerifyCard({ onVerified }: { onVerified?: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function resend() {
    setInfo(null);
    setError(null);
    const res = await apiRequest("/api/auth/send-verification", { method: "POST" });
    if (res.success) setInfo("A new code has been sent.");
    else setError(res.message || "Could not send code.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await apiRequest("/api/auth/verify-email", {
      method: "POST",
      data: { code },
    });
    setSubmitting(false);
    if (res.success) onVerified?.();
    else setError(res.message || "Invalid code.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}
      {info && (
        <div className="rounded-xl bg-success/10 px-4 py-3 text-sm text-success">{info}</div>
      )}
      <div className="space-y-2">
        <Label htmlFor="code">Verification code</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          placeholder="123456"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Verifying…" : "Verify"}
      </Button>
      <button
        type="button"
        onClick={resend}
        className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        Resend code
      </button>
    </form>
  );
}

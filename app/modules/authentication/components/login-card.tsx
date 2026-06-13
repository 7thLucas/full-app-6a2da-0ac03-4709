import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { apiRequest } from "~/lib/api.client";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

/**
 * LoginCard — client-side login form that posts to POST /api/auth/login
 * (served by this module's Express routes). On success the auth cookie is set
 * and we navigate to the dashboard.
 */
export function LoginCard({ onSuccess }: { onSuccess?: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await apiRequest("/api/auth/login", {
      method: "POST",
      data: { email, password },
    });
    setSubmitting(false);
    if (res.success) {
      if (onSuccess) onSuccess();
      else {
        window.location.href = "/dashboard";
      }
    } else {
      setError(res.message || "Invalid credentials");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@medspa.com"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            to="/auth/forgot-password"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        New to the platform?{" "}
        <Link to="/auth/register" className="font-medium text-primary underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </form>
  );
}

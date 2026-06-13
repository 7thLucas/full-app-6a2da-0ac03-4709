import { type ReactNode, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/modules/authentication";
import { AppShell } from "~/components/app-shell";
import { PageLoader } from "~/components/states";

/**
 * Guards a protected page: while auth is loading shows a loader; if no user,
 * redirects to /auth/login; otherwise renders inside the AppShell.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth/login", { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PageLoader />
      </div>
    );
  }
  if (!user) return null;

  return <AppShell>{children}</AppShell>;
}

import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/modules/authentication";
import { PageLoader } from "~/components/states";

export function meta() {
  return [{ title: "Radiance AI" }];
}

export default function IndexPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    navigate(user ? "/dashboard" : "/auth/login", { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <PageLoader />
    </div>
  );
}

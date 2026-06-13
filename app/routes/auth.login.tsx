import { AuthLayout } from "~/components/auth-layout";
import { LoginCard } from "~/modules/authentication";

export function meta() {
  return [{ title: "Sign in — Radiance AI" }];
}

export default function LoginRoute() {
  return (
    <AuthLayout title="Welcome back" description="Sign in to your med spa dashboard.">
      <LoginCard />
    </AuthLayout>
  );
}

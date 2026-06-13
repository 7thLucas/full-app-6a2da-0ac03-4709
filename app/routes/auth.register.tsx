import { AuthLayout } from "~/components/auth-layout";
import { RegisterCard } from "~/modules/authentication";

export function meta() {
  return [{ title: "Create account — Radiance AI" }];
}

export default function RegisterRoute() {
  return (
    <AuthLayout
      title="Create your account"
      description="Start automating your med spa front desk."
    >
      <RegisterCard />
    </AuthLayout>
  );
}

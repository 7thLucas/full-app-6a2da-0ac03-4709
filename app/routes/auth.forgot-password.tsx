import { AuthLayout } from "~/components/auth-layout";
import { ForgotPasswordCard } from "~/modules/authentication";

export function meta() {
  return [{ title: "Reset password — Radiance AI" }];
}

export default function ForgotPasswordRoute() {
  return (
    <AuthLayout
      title="Forgot password"
      description="We'll email you a link to reset it."
    >
      <ForgotPasswordCard />
    </AuthLayout>
  );
}

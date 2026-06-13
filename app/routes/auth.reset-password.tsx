import { AuthLayout } from "~/components/auth-layout";
import { ResetPasswordCard } from "~/modules/authentication";

export function meta() {
  return [{ title: "Set new password — Radiance AI" }];
}

export default function ResetPasswordRoute() {
  return (
    <AuthLayout title="Set a new password" description="Choose a strong password you'll remember.">
      <ResetPasswordCard />
    </AuthLayout>
  );
}

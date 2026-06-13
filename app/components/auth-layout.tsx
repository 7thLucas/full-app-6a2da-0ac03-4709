import { type ReactNode } from "react";
import { BrandLogo } from "~/components/brand-logo";
import { useConfigurables } from "~/modules/configurables";

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { config } = useConfigurables();
  const promise = config?.promise || "Capture leads, book appointments, and win back lapsed clients automatically.";
  const tagline = config?.tagline || "Your AI front desk that never sleeps";

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Brand panel — hidden on small screens */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground md:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(201,162,39,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(201,139,163,0.4), transparent 40%)",
          }}
        />
        <div className="relative">
          <BrandLogo className="[&_span]:text-primary-foreground" />
        </div>
        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-semibold leading-tight">{tagline}</h2>
          <p className="mt-4 text-base text-primary-foreground/80">{promise}</p>
        </div>
        <div className="relative text-sm text-primary-foreground/60">
          Trusted by modern med spas to grow on autopilot.
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-background px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden">
            <BrandLogo />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}

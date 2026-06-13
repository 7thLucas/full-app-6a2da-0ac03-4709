import { Sparkles } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { cn } from "~/lib/utils";

interface BrandLogoProps {
  className?: string;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * BrandLogo — renders the configurable logo + app name. Falls back to a
 * sparkle mark when no logo URL is configured. All values come from
 * useConfigurables() so the owner can rebrand without code changes.
 */
export function BrandLogo({ className, showName = true, size = "md" }: BrandLogoProps) {
  const { config } = useConfigurables();
  const name = config?.appName || "Radiance AI";
  const logoUrl = config?.logoUrl;
  const hasLogo = typeof logoUrl === "string" && logoUrl.length > 0 && !logoUrl.startsWith("FILL_");

  const markSize = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const textSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {hasLogo ? (
        <img
          src={logoUrl}
          alt={name}
          className={cn(markSize, "rounded-xl object-cover")}
        />
      ) : (
        <div
          className={cn(
            markSize,
            "flex items-center justify-center rounded-xl bg-primary text-primary-foreground",
          )}
        >
          <Sparkles className="h-1/2 w-1/2" strokeWidth={1.6} />
        </div>
      )}
      {showName && (
        <span className={cn("font-display font-semibold tracking-tight text-foreground", textSize)}>
          {name}
        </span>
      )}
    </div>
  );
}

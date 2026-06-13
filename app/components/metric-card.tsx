import { type LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "~/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: number;
  // "up" trend can be good (leads) or bad (no-show). invertTrend flips coloring.
  invertTrend?: boolean;
  accent?: "plum" | "gold";
  suffix?: string;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  invertTrend = false,
  accent = "plum",
  suffix,
}: MetricCardProps) {
  const hasTrend = typeof trend === "number" && !Number.isNaN(trend);
  const positive = hasTrend ? (invertTrend ? trend! <= 0 : trend! >= 0) : true;
  const isGold = accent === "gold";

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-4 card-soft md:p-5",
        isGold ? "border-gold/30" : "border-border",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            isGold ? "bg-gold/15 text-[#8a6f10]" : "bg-primary/[0.08] text-primary",
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
        </span>
        {hasTrend && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              positive ? "text-success" : "text-danger",
            )}
          >
            {trend! >= 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(trend!)}%
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-[28px] font-semibold leading-none tracking-tight text-foreground md:text-[34px]">
        {value}
        {suffix && <span className="ml-0.5 text-lg text-muted-foreground">{suffix}</span>}
      </p>
      <p className="mt-1.5 text-[13px] text-muted-foreground">{label}</p>
    </div>
  );
}

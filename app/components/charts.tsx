import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PLUM = "#7C3F58";
const GOLD = "#C9A227";
const PIE_COLORS: Record<string, string> = {
  Confirmed: "#3F8F6B",
  Completed: "#7C3F58",
  Pending: "#C9A227",
  Cancelled: "#C0556B",
  "No-Show": "#B5683E",
};
const FALLBACK = ["#7C3F58", "#C9A227", "#3F8F6B", "#5B7BA8", "#C98BA3", "#B5683E"];

const axisStyle = { fontSize: 12, fill: "#6B5E63" };

function TooltipBox({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function LeadsLineChart({ data }: { data: { date: string; leads: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PLUM} stopOpacity={0.25} />
            <stop offset="100%" stopColor={PLUM} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ECE3E0" vertical={false} />
        <XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} allowDecimals={false} width={36} />
        <Tooltip content={<TooltipBox />} />
        <Area
          type="monotone"
          dataKey="leads"
          name="Leads"
          stroke={PLUM}
          strokeWidth={2.5}
          fill="url(#leadGradient)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ConversionBarChart({
  data,
}: {
  data: { treatment: string; rate: number; total: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ECE3E0" horizontal={false} />
        <XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
        <YAxis
          type="category"
          dataKey="treatment"
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          width={104}
        />
        <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(124,63,88,0.05)" }} />
        <Bar dataKey="rate" name="Conversion" fill={GOLD} radius={[0, 6, 6, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusDonutChart({
  data,
}: {
  data: { status: string; count: number }[];
}) {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width="100%" height={200} className="!w-1/2 max-w-[220px]">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            innerRadius={52}
            outerRadius={82}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={PIE_COLORS[entry.status] || FALLBACK[i % FALLBACK.length]} />
            ))}
          </Pie>
          <Tooltip content={<TooltipBox />} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex-1 space-y-2">
        {data.map((entry, i) => (
          <li key={i} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: PIE_COLORS[entry.status] || FALLBACK[i % FALLBACK.length] }}
              />
              {entry.status}
            </span>
            <span className="font-semibold text-foreground">{entry.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

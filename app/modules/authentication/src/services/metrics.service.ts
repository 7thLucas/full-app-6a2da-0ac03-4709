import { startOfMonth, subMonths, eachDayOfInterval, subDays, format } from "date-fns";
import { LeadModel } from "../models/lead.model";
import { AppointmentModel } from "../models/appointment.model";

export class MetricsService {
  static async dashboard(orgId: string) {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const prevMonthStart = startOfMonth(subMonths(now, 1));

    const [
      leadsThisMonth,
      leadsPrevMonth,
      convertedThisMonth,
      convertedPrevMonth,
      appts,
      prevAppts,
    ] = await Promise.all([
      LeadModel.countDocuments({ orgId, createdAt: { $gte: monthStart } }),
      LeadModel.countDocuments({
        orgId,
        createdAt: { $gte: prevMonthStart, $lt: monthStart },
      }),
      LeadModel.countDocuments({
        orgId,
        status: "Converted",
        updatedAt: { $gte: monthStart },
      }),
      LeadModel.countDocuments({
        orgId,
        status: "Converted",
        updatedAt: { $gte: prevMonthStart, $lt: monthStart },
      }),
      AppointmentModel.find({ orgId, startAt: { $gte: monthStart } }).lean(),
      AppointmentModel.find({
        orgId,
        startAt: { $gte: prevMonthStart, $lt: monthStart },
      }).lean(),
    ]);

    const confirmRate = (list: any[]) => {
      const total = list.length;
      if (!total) return 0;
      const confirmed = list.filter(
        (a) => a.status === "Confirmed" || a.status === "Completed",
      ).length;
      return Math.round((confirmed / total) * 100);
    };
    const noShowRate = (list: any[]) => {
      const total = list.length;
      if (!total) return 0;
      const ns = list.filter((a) => a.status === "No-Show").length;
      return Math.round((ns / total) * 100);
    };

    const revenue = appts
      .filter((a) => a.status === "Confirmed" || a.status === "Completed")
      .reduce((sum, a) => sum + (a.value || 0), 0);
    const prevRevenue = prevAppts
      .filter((a) => a.status === "Confirmed" || a.status === "Completed")
      .reduce((sum, a) => sum + (a.value || 0), 0);

    const pct = (cur: number, prev: number) =>
      prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100);

    return {
      leadsThisMonth,
      leadsTrend: pct(leadsThisMonth, leadsPrevMonth),
      converted: convertedThisMonth,
      convertedTrend: pct(convertedThisMonth, convertedPrevMonth),
      confirmRate: confirmRate(appts),
      confirmRateTrend: confirmRate(appts) - confirmRate(prevAppts),
      noShowRate: noShowRate(appts),
      noShowRateTrend: noShowRate(appts) - noShowRate(prevAppts),
      revenue,
      revenueTrend: pct(revenue, prevRevenue),
    };
  }

  /** Leads created per day over the last `days` days. */
  static async leadsOverTime(orgId: string, days = 30) {
    const end = new Date();
    const start = subDays(end, days - 1);
    const leads = await LeadModel.find({
      orgId,
      createdAt: { $gte: start },
    })
      .select("createdAt")
      .lean();

    const buckets: Record<string, number> = {};
    eachDayOfInterval({ start, end }).forEach((d) => {
      buckets[format(d, "yyyy-MM-dd")] = 0;
    });
    leads.forEach((l: any) => {
      const k = format(new Date(l.createdAt), "yyyy-MM-dd");
      if (k in buckets) buckets[k] += 1;
    });

    return Object.entries(buckets).map(([date, count]) => ({
      date: format(new Date(date), "MMM d"),
      leads: count,
    }));
  }

  /** Conversion grouped by treatment type. */
  static async conversionByTreatment(orgId: string) {
    const leads = await LeadModel.find({ orgId })
      .select("treatment status")
      .lean();
    const map: Record<string, { total: number; converted: number }> = {};
    leads.forEach((l: any) => {
      const t = l.treatment || "Other";
      map[t] = map[t] || { total: 0, converted: 0 };
      map[t].total += 1;
      if (l.status === "Converted") map[t].converted += 1;
    });
    return Object.entries(map)
      .map(([treatment, v]) => ({
        treatment,
        converted: v.converted,
        total: v.total,
        rate: v.total ? Math.round((v.converted / v.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }

  /** Appointment status distribution (for pie/donut). */
  static async appointmentStatusDistribution(orgId: string) {
    const appts = await AppointmentModel.find({ orgId }).select("status").lean();
    const map: Record<string, number> = {};
    appts.forEach((a: any) => {
      map[a.status] = (map[a.status] || 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({ status, count }));
  }
}

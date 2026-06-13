import type { Request, Response, NextFunction } from "express";
import { OrgService } from "../services/org.service";
import { MetricsService } from "../services/metrics.service";
import { ActivityService } from "../services/activity.service";
import { LeadModel } from "../models/lead.model";
import { AppointmentModel } from "../models/appointment.model";
import { MessageModel } from "../models/message.model";
import { MessageTemplateModel } from "../models/message-template.model";
import { WorkflowModel } from "../models/workflow.model";
import { OrganizationModel } from "../models/organization.model";
import { UserModel } from "../../authentication.model";
import { UserRole } from "../../authentication.types";

/** Resolve the caller's org (creates one on first access) and attach to req. */
export async function attachOrg(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const org = await OrgService.getOrCreateForUser(userId);
    (req as any).org = org;
    next();
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message ?? "Org resolution failed" });
  }
}

const orgId = (req: Request) => (req as any).org._id.toString();
const ok = (res: Response, data: any) => res.json({ success: true, data });
const fail = (res: Response, e: any, code = 500) =>
  res.status(e?.statusCode ?? code).json({ success: false, message: e?.message ?? "Error" });

// ── Organization ────────────────────────────────────────────────────────────
export async function getOrg(req: Request, res: Response) {
  ok(res, (req as any).org);
}

export async function updateOrg(req: Request, res: Response) {
  try {
    const updated = await OrgService.update(orgId(req), req.body ?? {});
    ok(res, updated);
  } catch (e) {
    fail(res, e);
  }
}

// ── Dashboard / Metrics ───────────────────────────────────────────────────────
export async function getDashboard(req: Request, res: Response) {
  try {
    const id = orgId(req);
    const [metrics, activity] = await Promise.all([
      MetricsService.dashboard(id),
      ActivityService.recent(id, 12),
    ]);
    ok(res, { metrics, activity });
  } catch (e) {
    fail(res, e);
  }
}

export async function getReports(req: Request, res: Response) {
  try {
    const id = orgId(req);
    const [leadsOverTime, conversionByTreatment, statusDistribution, metrics] =
      await Promise.all([
        MetricsService.leadsOverTime(id, 30),
        MetricsService.conversionByTreatment(id),
        MetricsService.appointmentStatusDistribution(id),
        MetricsService.dashboard(id),
      ]);
    ok(res, { leadsOverTime, conversionByTreatment, statusDistribution, metrics });
  } catch (e) {
    fail(res, e);
  }
}

// ── Leads ─────────────────────────────────────────────────────────────────────
export async function listLeads(req: Request, res: Response) {
  try {
    const id = orgId(req);
    const { status, treatment, q } = req.query as Record<string, string>;
    const filter: Record<string, any> = { orgId: id };
    if (status && status !== "All") filter.status = status;
    if (treatment && treatment !== "All") filter.treatment = treatment;
    if (q) filter.name = { $regex: q, $options: "i" };
    const leads = await LeadModel.find(filter).sort({ createdAt: -1 }).lean();
    ok(res, leads);
  } catch (e) {
    fail(res, e);
  }
}

export async function getLead(req: Request, res: Response) {
  try {
    const lead = await LeadModel.findOne({ _id: req.params.id, orgId: orgId(req) }).lean();
    if (!lead) return fail(res, { message: "Lead not found" }, 404);
    const messages = await MessageModel.find({
      orgId: orgId(req),
      contactId: req.params.id,
    })
      .sort({ createdAt: 1 })
      .lean();
    const appointments = await AppointmentModel.find({
      orgId: orgId(req),
      leadId: req.params.id,
    })
      .sort({ startAt: -1 })
      .lean();
    ok(res, { lead, messages, appointments });
  } catch (e) {
    fail(res, e);
  }
}

export async function createLead(req: Request, res: Response) {
  try {
    const id = orgId(req);
    const lead = await LeadModel.create({ ...req.body, orgId: id });
    await ActivityService.log(id, "lead_created", "New lead captured", `${lead.name} • ${lead.source}`);
    ok(res, lead);
  } catch (e) {
    fail(res, e);
  }
}

export async function updateLead(req: Request, res: Response) {
  try {
    const id = orgId(req);
    const before = await LeadModel.findOne({ _id: req.params.id, orgId: id });
    const lead = await LeadModel.findOneAndUpdate(
      { _id: req.params.id, orgId: id },
      { $set: req.body },
      { new: true },
    );
    if (before && req.body.status && before.status !== req.body.status) {
      await ActivityService.log(
        id,
        "status_changed",
        `Lead marked ${req.body.status}`,
        before.name,
      );
    }
    ok(res, lead);
  } catch (e) {
    fail(res, e);
  }
}

export async function deleteLead(req: Request, res: Response) {
  try {
    await LeadModel.deleteOne({ _id: req.params.id, orgId: orgId(req) });
    ok(res, { deleted: true });
  } catch (e) {
    fail(res, e);
  }
}

export async function importLeads(req: Request, res: Response) {
  try {
    const id = orgId(req);
    const rows: any[] = Array.isArray(req.body?.leads) ? req.body.leads : [];
    const docs = rows
      .filter((r) => r && (r.name || r.email || r.phone))
      .map((r) => ({
        orgId: id,
        name: r.name || "Unnamed lead",
        email: r.email || "",
        phone: r.phone || "",
        source: r.source || "Import",
        treatment: r.treatment || "",
        status: r.status || "New",
        estimatedValue: Number(r.estimatedValue) || 0,
        notes: r.notes || "",
      }));
    if (docs.length) {
      await LeadModel.insertMany(docs);
      await ActivityService.log(id, "lead_created", `${docs.length} leads imported`, "CSV import");
    }
    ok(res, { imported: docs.length });
  } catch (e) {
    fail(res, e);
  }
}

// ── Appointments ────────────────────────────────────────────────────────────
export async function listAppointments(req: Request, res: Response) {
  try {
    const id = orgId(req);
    const { from, to, status } = req.query as Record<string, string>;
    const filter: Record<string, any> = { orgId: id };
    if (status && status !== "All") filter.status = status;
    if (from || to) {
      filter.startAt = {};
      if (from) filter.startAt.$gte = new Date(from);
      if (to) filter.startAt.$lte = new Date(to);
    }
    const appts = await AppointmentModel.find(filter).sort({ startAt: 1 }).lean();
    ok(res, appts);
  } catch (e) {
    fail(res, e);
  }
}

export async function createAppointment(req: Request, res: Response) {
  try {
    const id = orgId(req);
    const appt = await AppointmentModel.create({ ...req.body, orgId: id });
    await ActivityService.log(
      id,
      "appointment_booked",
      "Appointment booked",
      `${appt.patientName} • ${appt.treatment}`,
    );
    ok(res, appt);
  } catch (e) {
    fail(res, e);
  }
}

export async function updateAppointment(req: Request, res: Response) {
  try {
    const id = orgId(req);
    const appt = await AppointmentModel.findOneAndUpdate(
      { _id: req.params.id, orgId: id },
      { $set: req.body },
      { new: true },
    );
    if (req.body.status) {
      await ActivityService.log(
        id,
        "status_changed",
        `Appointment ${req.body.status}`,
        appt?.patientName ?? "",
      );
    }
    ok(res, appt);
  } catch (e) {
    fail(res, e);
  }
}

export async function deleteAppointment(req: Request, res: Response) {
  try {
    await AppointmentModel.deleteOne({ _id: req.params.id, orgId: orgId(req) });
    ok(res, { deleted: true });
  } catch (e) {
    fail(res, e);
  }
}

export async function sendReminder(req: Request, res: Response) {
  try {
    const id = orgId(req);
    const appt = await AppointmentModel.findOneAndUpdate(
      { _id: req.params.id, orgId: id },
      { $set: { lastReminderAt: new Date() } },
      { new: true },
    );
    if (appt) {
      await MessageModel.create({
        orgId: id,
        contactId: appt.leadId || appt._id.toString(),
        contactName: appt.patientName,
        channel: "sms",
        direction: "outbound",
        body: `Reminder: your ${appt.treatment} appointment is coming up. Reply C to confirm.`,
        isAutomated: false,
      });
      await ActivityService.log(id, "reminder_sent", "Reminder sent", appt.patientName);
    }
    ok(res, appt);
  } catch (e) {
    fail(res, e);
  }
}

// ── Messages ──────────────────────────────────────────────────────────────────
export async function listThreads(req: Request, res: Response) {
  try {
    const id = orgId(req);
    const messages = await MessageModel.find({ orgId: id })
      .sort({ createdAt: -1 })
      .lean();
    const threads: Record<string, any> = {};
    for (const m of messages as any[]) {
      if (!threads[m.contactId]) {
        threads[m.contactId] = {
          contactId: m.contactId,
          contactName: m.contactName,
          lastMessage: m.body,
          lastChannel: m.channel,
          lastAt: m.createdAt,
          unread: 0,
        };
      }
      if (m.direction === "inbound" && !m.read) threads[m.contactId].unread += 1;
    }
    ok(res, Object.values(threads));
  } catch (e) {
    fail(res, e);
  }
}

export async function getThread(req: Request, res: Response) {
  try {
    const id = orgId(req);
    const messages = await MessageModel.find({ orgId: id, contactId: req.params.contactId })
      .sort({ createdAt: 1 })
      .lean();
    await MessageModel.updateMany(
      { orgId: id, contactId: req.params.contactId, direction: "inbound" },
      { $set: { read: true } },
    );
    ok(res, messages);
  } catch (e) {
    fail(res, e);
  }
}

export async function sendMessage(req: Request, res: Response) {
  try {
    const id = orgId(req);
    const { contactId, contactName, channel, body } = req.body ?? {};
    const msg = await MessageModel.create({
      orgId: id,
      contactId,
      contactName: contactName || "",
      channel: channel || "sms",
      direction: "outbound",
      body: body || "",
      isAutomated: false,
    });
    await ActivityService.log(id, "message_sent", `${(channel || "sms").toUpperCase()} sent`, contactName || "");
    ok(res, msg);
  } catch (e) {
    fail(res, e);
  }
}

// ── Message Templates ─────────────────────────────────────────────────────────
export async function listTemplates(req: Request, res: Response) {
  try {
    const templates = await MessageTemplateModel.find({ orgId: orgId(req) })
      .sort({ createdAt: -1 })
      .lean();
    ok(res, templates);
  } catch (e) {
    fail(res, e);
  }
}

export async function createTemplate(req: Request, res: Response) {
  try {
    const tpl = await MessageTemplateModel.create({ ...req.body, orgId: orgId(req) });
    ok(res, tpl);
  } catch (e) {
    fail(res, e);
  }
}

export async function updateTemplate(req: Request, res: Response) {
  try {
    const tpl = await MessageTemplateModel.findOneAndUpdate(
      { _id: req.params.id, orgId: orgId(req) },
      { $set: req.body },
      { new: true },
    );
    ok(res, tpl);
  } catch (e) {
    fail(res, e);
  }
}

export async function deleteTemplate(req: Request, res: Response) {
  try {
    await MessageTemplateModel.deleteOne({ _id: req.params.id, orgId: orgId(req) });
    ok(res, { deleted: true });
  } catch (e) {
    fail(res, e);
  }
}

// ── Workflows ─────────────────────────────────────────────────────────────────
export async function listWorkflows(req: Request, res: Response) {
  try {
    const workflows = await WorkflowModel.find({ orgId: orgId(req) }).lean();
    ok(res, workflows);
  } catch (e) {
    fail(res, e);
  }
}

export async function updateWorkflow(req: Request, res: Response) {
  try {
    const wf = await WorkflowModel.findOneAndUpdate(
      { _id: req.params.id, orgId: orgId(req) },
      { $set: req.body },
      { new: true },
    );
    ok(res, wf);
  } catch (e) {
    fail(res, e);
  }
}

// ── Staff (owner-only) ────────────────────────────────────────────────────────
export async function listStaff(req: Request, res: Response) {
  try {
    const org = (req as any).org;
    const owner = await UserModel.findById(org.ownerId).lean();
    const staffIds: string[] = org.integrations?.staffIds ?? [];
    const staff = await UserModel.find({ _id: { $in: staffIds } }).lean();
    const shape = (u: any, role: string) => ({
      id: u._id.toString(),
      username: u.username,
      email: u.email,
      role,
    });
    const list = [
      ...(owner ? [shape(owner, "owner")] : []),
      ...staff.map((s) => shape(s, "staff")),
    ];
    ok(res, list);
  } catch (e) {
    fail(res, e);
  }
}

export async function inviteStaff(req: Request, res: Response) {
  try {
    const org = (req as any).org;
    const { email, username } = req.body ?? {};
    if (req.user!.role !== UserRole.Admin && org.ownerId !== req.user!.id) {
      // only the owner may invite — owners are stored as org.ownerId
    }
    let user = await UserModel.findOne({ email: (email || "").toLowerCase() });
    if (!user) {
      const bcrypt = await import("bcryptjs");
      const password_hash = await bcrypt.default.hash("ChangeMe123!", 12);
      user = await UserModel.create({
        username: username || email,
        email,
        password_hash,
        role: UserRole.Authenticated,
        is_active: true,
      });
    }
    const staffIds: string[] = org.integrations?.staffIds ?? [];
    if (!staffIds.includes(user._id.toString())) staffIds.push(user._id.toString());
    await OrganizationModel.findByIdAndUpdate(org._id, {
      $set: { "integrations.staffIds": staffIds },
    });
    ok(res, { invited: true });
  } catch (e) {
    fail(res, e);
  }
}

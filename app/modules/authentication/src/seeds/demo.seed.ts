import bcrypt from "bcryptjs";
import { subDays, addDays, setHours, setMinutes } from "date-fns";
import { createLogger } from "~/lib/logger";
import { UserModel } from "../../authentication.model";
import { UserRole } from "../../authentication.types";
import { OrganizationModel } from "../models/organization.model";
import { LeadModel } from "../models/lead.model";
import { AppointmentModel } from "../models/appointment.model";
import { MessageModel } from "../models/message.model";
import { MessageTemplateModel } from "../models/message-template.model";
import { WorkflowModel } from "../models/workflow.model";
import { ActivityModel } from "../models/activity.model";

const logger = createLogger("DemoSeed");

const DEMO_EMAIL = "owner@radiance.ai";
const TREATMENTS = ["Botox", "Dermal Fillers", "Microneedling", "Laser Hair Removal", "HydraFacial", "Chemical Peel"];
const SOURCES = ["Google Ads", "Facebook", "Instagram", "Website", "Referral", "Walk-in"];
const FIRST = ["Olivia", "Emma", "Sophia", "Ava", "Isabella", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn", "Grace", "Chloe"];
const LAST = ["Bennett", "Carter", "Hayes", "Reed", "Foster", "Brooks", "Sloane", "Quinn", "Monroe", "Ellis", "Parker", "Lane"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const WORKFLOWS = [
  { key: "lead_follow_up", name: "Lead Follow-Up", config: { steps: 4, timings: ["5m", "1d", "3d", "7d"] },
    smsTemplate: "Hi {{name}}, thanks for your interest in {{treatment}}! When works best for a quick call?",
    emailTemplate: "Hi {{name}},\n\nThank you for reaching out about {{treatment}}. Reply to book your complimentary consultation." },
  { key: "appointment_reminder", name: "Appointment Reminder", config: { reminderHours: [48, 24, 2] },
    smsTemplate: "Reminder: your {{treatment}} appointment is on {{date}} at {{time}}. Reply C to confirm.",
    emailTemplate: "Hi {{name}},\n\nA friendly reminder of your {{treatment}} appointment on {{date}} at {{time}}." },
  { key: "re_engagement", name: "Re-Engagement", config: { daysSince: [90, 180, 365] },
    smsTemplate: "Hi {{name}}, it's been a while! Ready to glow again? Book your next {{treatment}}.",
    emailTemplate: "Hi {{name}},\n\nWe miss you! It's the perfect time to refresh your results." },
  { key: "review_request", name: "Review Request", config: { daysAfter: [1, 3, 7] },
    smsTemplate: "Hi {{name}}, we hope you loved your {{treatment}}! Mind sharing a quick review? {{link}}",
    emailTemplate: "Hi {{name}},\n\nThank you for visiting! Would you leave a quick review? {{link}}" },
];

const TEMPLATES = [
  { name: "Warm welcome", channel: "sms", body: "Hi {{name}}! Welcome to the family. How can we help you glow today?" },
  { name: "Booking confirmation", channel: "sms", body: "You're booked for {{treatment}} on {{date}} at {{time}}!" },
  { name: "Consultation follow-up", channel: "email", body: "Hi {{name}},\n\nIt was lovely speaking with you. Here's your {{treatment}} plan." },
];

export async function seedDemoData(): Promise<void> {
  try {
    const existing = await UserModel.findOne({ email: DEMO_EMAIL });
    if (existing) {
      logger.info("Demo data already present, skipping.");
      return;
    }

    logger.info("Seeding Radiance AI demo data…");

    const password_hash = await bcrypt.hash("Radiance123!", 12);
    const owner = await UserModel.create({
      username: "Dr. Ava Lin",
      email: DEMO_EMAIL,
      password_hash,
      role: UserRole.Authenticated,
      is_active: true,
      email_verified: true,
    });
    const ownerId = owner._id.toString();

    const org = await OrganizationModel.create({
      name: "Luminous Med Spa",
      address: "120 Rosewood Ave, Suite 4, Austin, TX",
      phone: "(512) 555-0188",
      timezone: "America/Chicago",
      plan: "Growth",
      ownerId,
      integrations: {
        n8nBaseUrl: "https://n8n.luminous.example.com",
        twilioFrom: "+15125550188",
        staffIds: [],
      },
    });
    const orgId = org._id.toString();

    await WorkflowModel.insertMany(
      WORKFLOWS.map((w) => ({
        ...w,
        orgId,
        enabled: w.key !== "re_engagement",
        webhookUrl: `https://n8n.luminous.example.com/webhook/${w.key}`,
      })),
    );
    await MessageTemplateModel.insertMany(TEMPLATES.map((t) => ({ ...t, orgId })));

    // Leads — spread across this month and last month
    const statuses = ["New", "Contacted", "Booked", "Converted", "Lost"] as const;
    const leads: any[] = [];
    for (let i = 0; i < 64; i++) {
      const name = `${rand(FIRST)} ${rand(LAST)}`;
      const created = subDays(new Date(), randInt(0, 55));
      const status = rand([...statuses, "New", "Contacted", "Converted"]);
      leads.push({
        orgId,
        name,
        phone: `(512) 555-0${randInt(100, 999)}`,
        email: `${name.split(" ")[0].toLowerCase()}.${randInt(10, 99)}@example.com`,
        source: rand(SOURCES),
        treatment: rand(TREATMENTS),
        status,
        estimatedValue: randInt(200, 1800),
        notes: "",
        createdAt: created,
        updatedAt: subDays(new Date(), randInt(0, 5)),
      });
    }
    const insertedLeads = await LeadModel.insertMany(leads);

    // Appointments — some this month (past + upcoming)
    const apptStatuses = ["Pending", "Confirmed", "Confirmed", "Completed", "Cancelled", "No-Show"] as const;
    const appts: any[] = [];
    for (let i = 0; i < 38; i++) {
      const lead = rand(insertedLeads as any[]);
      const future = Math.random() > 0.45;
      const day = future ? addDays(new Date(), randInt(0, 18)) : subDays(new Date(), randInt(1, 28));
      const start = setMinutes(setHours(day, randInt(9, 17)), rand([0, 15, 30, 45]));
      const status = future ? rand(["Pending", "Confirmed", "Confirmed"]) : rand([...apptStatuses]);
      appts.push({
        orgId,
        leadId: lead._id.toString(),
        patientName: lead.name,
        phone: lead.phone,
        email: lead.email,
        treatment: lead.treatment,
        startAt: start,
        durationMinutes: rand([30, 45, 60, 90]),
        status,
        value: randInt(180, 1500),
        notes: "",
      });
    }
    await AppointmentModel.insertMany(appts);

    // Messages — a few conversation threads
    const threadLeads = (insertedLeads as any[]).slice(0, 8);
    const messages: any[] = [];
    for (const lead of threadLeads) {
      const base = subDays(new Date(), randInt(1, 10));
      messages.push(
        {
          orgId, contactId: lead._id.toString(), contactName: lead.name,
          channel: "sms", direction: "outbound", isAutomated: true,
          body: `Hi ${lead.name.split(" ")[0]}, thanks for your interest in ${lead.treatment}! When works best for a quick call?`,
          createdAt: base, read: true,
        },
        {
          orgId, contactId: lead._id.toString(), contactName: lead.name,
          channel: "sms", direction: "inbound", isAutomated: false,
          body: "Hi! I'd love to learn more. Are you available this week?",
          createdAt: addDays(base, 0.02), read: Math.random() > 0.4,
        },
        {
          orgId, contactId: lead._id.toString(), contactName: lead.name,
          channel: "sms", direction: "outbound", isAutomated: false,
          body: "Absolutely! We have openings Thursday and Friday. Which suits you?",
          createdAt: addDays(base, 0.05), read: true,
        },
      );
    }
    await MessageModel.insertMany(messages);

    // Activity feed
    const activities = [
      { type: "lead_created", title: "New lead captured", description: `${rand(FIRST)} ${rand(LAST)} • Google Ads` },
      { type: "appointment_booked", title: "Appointment booked", description: `${rand(FIRST)} ${rand(LAST)} • Botox` },
      { type: "message_sent", title: "SMS sent", description: "Appointment reminder delivered" },
      { type: "review_requested", title: "Review requested", description: `${rand(FIRST)} ${rand(LAST)} • HydraFacial` },
      { type: "status_changed", title: "Lead marked Converted", description: `${rand(FIRST)} ${rand(LAST)}` },
      { type: "lead_created", title: "New lead captured", description: `${rand(FIRST)} ${rand(LAST)} • Instagram` },
    ];
    await ActivityModel.insertMany(
      activities.map((a, idx) => ({ ...a, orgId, createdAt: subDays(new Date(), idx) })),
    );

    logger.info(`✅ Demo data seeded for ${org.name} (login: ${DEMO_EMAIL} / Radiance123!)`);
  } catch (error) {
    logger.error("❌ Failed to seed demo data:", error);
  }
}

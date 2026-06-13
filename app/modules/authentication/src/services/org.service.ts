import { OrganizationModel } from "../models/organization.model";
import { WorkflowModel } from "../models/workflow.model";
import { MessageTemplateModel } from "../models/message-template.model";
import { UserModel } from "../../authentication.model";

const DEFAULT_WORKFLOWS = [
  {
    key: "lead_follow_up",
    name: "Lead Follow-Up",
    smsTemplate:
      "Hi {{name}}, thanks for your interest in {{treatment}}! When works best for a quick call to get you booked?",
    emailTemplate:
      "Hi {{name}},\n\nThank you for reaching out about {{treatment}}. We'd love to help you look and feel your best. Reply to book your complimentary consultation.\n\nWarmly,\nThe team",
    config: { steps: 4, timings: ["5m", "1d", "3d", "7d"] },
  },
  {
    key: "appointment_reminder",
    name: "Appointment Reminder",
    smsTemplate:
      "Reminder: your {{treatment}} appointment is on {{date}} at {{time}}. Reply C to confirm or R to reschedule.",
    emailTemplate:
      "Hi {{name}},\n\nThis is a friendly reminder of your upcoming {{treatment}} appointment on {{date}} at {{time}}.\n\nSee you soon!",
    config: { reminderHours: [48, 24, 2] },
  },
  {
    key: "re_engagement",
    name: "Re-Engagement",
    smsTemplate:
      "Hi {{name}}, it's been a while! Ready to glow again? Book your next {{treatment}} and enjoy a returning-client perk.",
    emailTemplate:
      "Hi {{name}},\n\nWe miss seeing you! It's the perfect time to refresh your results. Book your next visit today.",
    config: { daysSince: [90, 180, 365] },
  },
  {
    key: "review_request",
    name: "Review Request",
    smsTemplate:
      "Hi {{name}}, we hope you loved your {{treatment}}! Mind sharing a quick review? {{link}}",
    emailTemplate:
      "Hi {{name}},\n\nThank you for visiting us! Your feedback means the world. Would you take a moment to leave a review? {{link}}",
    config: { daysAfter: [1, 3, 7] },
  },
];

const DEFAULT_TEMPLATES = [
  { name: "Warm welcome", channel: "sms", body: "Hi {{name}}! Welcome to the family. How can we help you glow today?" },
  { name: "Booking confirmation", channel: "sms", body: "You're booked for {{treatment}} on {{date}} at {{time}}. We can't wait to see you!" },
  { name: "Consultation follow-up", channel: "email", body: "Hi {{name}},\n\nIt was lovely speaking with you. Here's a summary of the {{treatment}} plan we discussed." },
];

export class OrgService {
  /** Resolve (or lazily provision) the organization for a given owner user. */
  static async getOrCreateForUser(userId: string) {
    let org = await OrganizationModel.findOne({ ownerId: userId });
    if (org) return org;

    const user = await UserModel.findById(userId);
    const name = user?.username ? `${user.username}'s Med Spa` : "My Med Spa";

    org = await OrganizationModel.create({ name, ownerId: userId });

    // Seed default workflows + templates for the new org
    await WorkflowModel.insertMany(
      DEFAULT_WORKFLOWS.map((w) => ({ ...w, orgId: org!._id.toString() })),
    );
    await MessageTemplateModel.insertMany(
      DEFAULT_TEMPLATES.map((t) => ({ ...t, orgId: org!._id.toString() })),
    );

    return org;
  }

  static async update(orgId: string, patch: Record<string, any>) {
    return OrganizationModel.findByIdAndUpdate(orgId, { $set: patch }, { new: true });
  }
}

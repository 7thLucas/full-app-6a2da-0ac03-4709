// Shared client-side domain types + helpers for Radiance AI.

export type LeadStatus = "New" | "Contacted" | "Booked" | "Converted" | "Lost";
export type AppointmentStatus =
  | "Pending"
  | "Confirmed"
  | "Cancelled"
  | "No-Show"
  | "Completed";

export interface Lead {
  _id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  treatment: string;
  status: LeadStatus;
  estimatedValue: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
}

export interface Appointment {
  _id: string;
  leadId: string;
  patientName: string;
  phone: string;
  email: string;
  treatment: string;
  startAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  value: number;
  notes: string;
  lastReminderAt?: string;
}

export interface Message {
  _id: string;
  contactId: string;
  contactName: string;
  channel: "sms" | "email";
  direction: "inbound" | "outbound";
  body: string;
  isAutomated: boolean;
  read: boolean;
  createdAt: string;
}

export interface Thread {
  contactId: string;
  contactName: string;
  lastMessage: string;
  lastChannel: "sms" | "email";
  lastAt: string;
  unread: number;
}

export interface MessageTemplate {
  _id: string;
  name: string;
  channel: string;
  body: string;
}

export interface Workflow {
  _id: string;
  key: string;
  name: string;
  enabled: boolean;
  webhookUrl: string;
  smsTemplate: string;
  emailTemplate: string;
  config: Record<string, any>;
}

export interface Organization {
  _id: string;
  name: string;
  address: string;
  phone: string;
  timezone: string;
  language: string;
  plan: string;
  ownerId: string;
  integrations: Record<string, any>;
}

export interface DashboardMetrics {
  leadsThisMonth: number;
  leadsTrend: number;
  converted: number;
  convertedTrend: number;
  confirmRate: number;
  confirmRateTrend: number;
  noShowRate: number;
  noShowRateTrend: number;
  revenue: number;
  revenueTrend: number;
}

export const LEAD_STATUSES: LeadStatus[] = ["New", "Contacted", "Booked", "Converted", "Lost"];
export const APPT_STATUSES: AppointmentStatus[] = ["Pending", "Confirmed", "Cancelled", "No-Show", "Completed"];
export const TREATMENTS = [
  "Botox",
  "Dermal Fillers",
  "Microneedling",
  "Laser Hair Removal",
  "HydraFacial",
  "Chemical Peel",
  "Other",
];
export const LEAD_SOURCES = [
  "Google Ads",
  "Facebook",
  "Instagram",
  "Website",
  "Referral",
  "Walk-in",
  "Other",
];

// Maps a status to a Badge variant (color is paired with the text label).
export function leadStatusVariant(s: LeadStatus) {
  switch (s) {
    case "New":
      return "info" as const;
    case "Contacted":
      return "warning" as const;
    case "Booked":
      return "plum" as const;
    case "Converted":
      return "success" as const;
    case "Lost":
      return "danger" as const;
    default:
      return "default" as const;
  }
}

export function apptStatusVariant(s: AppointmentStatus) {
  switch (s) {
    case "Pending":
      return "warning" as const;
    case "Confirmed":
      return "success" as const;
    case "Completed":
      return "plum" as const;
    case "Cancelled":
      return "danger" as const;
    case "No-Show":
      return "danger" as const;
    default:
      return "default" as const;
  }
}

export function formatCurrency(value: number, symbol = "$") {
  return `${symbol}${Math.round(value).toLocaleString()}`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Stable warm avatar tint from a name.
const AVATAR_TINTS = [
  "#7C3F58",
  "#C98BA3",
  "#C9A227",
  "#3F8F6B",
  "#5B7BA8",
  "#B5683E",
];
export function avatarTint(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_TINTS[sum % AVATAR_TINTS.length];
}

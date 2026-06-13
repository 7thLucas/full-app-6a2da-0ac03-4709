# Radiance AI — Product Overview

## What It Is
Radiance AI is a mobile-first client dashboard for **med spa owners** to manage their AI automation service. It is the control center where owners and staff monitor lead generation, appointments, automated messaging workflows, and revenue impact — all powered by n8n-compatible webhook automations and backed by Supabase.

## Primary Users
- **Med Spa Owner** (primary): Full access to every feature — dashboard, leads, appointments, AI automation settings, messaging, reporting, billing, and organization settings.
- **Staff Member** (secondary): Limited access — can view the dashboard, manage leads/appointments and messaging, but **cannot** access billing.

## Brand & Tone
- **Tone**: Calm, premium, confidence-inspiring. The product should feel like a luxe wellness brand crossed with a sharp analytics tool — clean, trustworthy, and effortless.
- **Voice**: Professional but warm. Owners are busy entrepreneurs, not engineers. Avoid jargon; surface insight, not raw data.
- **Promise**: "Your AI front desk that never sleeps." Radiance AI captures leads, books appointments, reminds patients, and wins back lapsed clients automatically.

## Strategic Principles
1. **Mobile-first, always.** Owners check this on their phone between treatments. Every screen must be touch-friendly and read well on a small viewport before scaling up.
2. **Insight over data.** Lead with the metrics that matter (leads, conversion, no-show rate, revenue influenced). Make the "so what" obvious.
3. **Automation is the hero.** The AI workflows (Lead Follow-Up, Appointment Reminder, Re-Engagement, Review Request) are the differentiator. Make their status and impact visible and easy to tune.
4. **Trust through transparency.** Show every message the AI sends. Owners need to feel in control of their patient relationships.
5. **Fast to act.** Quick actions, manual overrides (confirm/cancel/reschedule/no-show, manual reminders) must be one tap away.

## Core Scope (Initial Build)
- **Dashboard home**: real-time metrics (total leads this month, leads converted, appointment confirmation rate, no-show rate, revenue influenced) + recent activity log + quick actions.
- **Lead management**: lead list with status filters (New, Contacted, Booked, Converted, Lost), date/treatment filters, lead detail pages, manual create, CSV import/export, status changes.
- **Appointment management**: calendar views (month/week/day), appointment detail, confirm/cancel/reschedule/no-show, manual reminders.
- **AI automation settings**: toggles + customizable templates for Lead Follow-Up, Appointment Reminder, Re-Engagement, and Review Request workflows (n8n-compatible webhook config).
- **Messaging center**: inbox of SMS/email (inbound + outbound), per-patient conversation threads, message templates.
- **Reporting & analytics**: pre-built reports + charts (leads over time, conversion by treatment, appointment status distribution), CSV export.
- **Billing & org settings**: plan management (Starter/Growth/Pro), organization profile, staff roles, integration settings (webhook URLs), account settings.

## Auth & Roles
- Supabase Auth (email/password).
- Two roles: **owner** (full) and **staff** (no billing).
- Onboarding: email verification + organization setup (med spa name, address, timezone).

## Anti-References (What NOT To Be)
- Not a cluttered, enterprise CRM with 40 columns of tiny text.
- Not a generic admin template — it should feel bespoke to the med spa wellness world.
- Not desktop-first with a cramped mobile afterthought.
- Not raw and technical — hide webhook/integration complexity behind clean settings screens.
# Radiance AI — Product Overview

## Product Identity
**Name**: Radiance AI  
**Type**: SaaS client dashboard / business management platform  
**Tagline**: The AI-powered command center for med spa owners

## What It Is
Radiance AI is a production-ready, mobile-first web application that gives med spa owners a unified command center to manage their AI automation service. It consolidates lead pipeline management, appointment scheduling, two-way messaging (SMS + email), AI workflow automation via n8n, reporting, and billing — replacing scattered tools with one purpose-built dashboard built on React 18 + Supabase.

## Users & Roles
- **Med Spa Owner** (primary): Full access — dashboard metrics, lead management, appointment calendar, AI automation settings, messaging center, reports, billing, and all settings
- **Staff Member** (secondary): Limited access — view dashboard, manage leads and appointments, use messaging center; no billing access

## Auth & Onboarding
Supabase Auth with email/password (optional OAuth). New users complete email verification, then organization onboarding: med spa name, address, phone, timezone, language.

## The Problem
Med spa owners running AI-assisted client acquisition juggle multiple disconnected tools. Manual lead follow-ups slip through the cracks, no-shows go unreduced, staff time is consumed by repetitive outreach, and there is no single view of automation health or revenue impact.

## The Solution
A single authenticated dashboard that lets med spa owners monitor real-time business metrics, manage the full lead-to-conversion lifecycle, control four AI automation workflows (posting to n8n webhooks), communicate with patients via a unified SMS + email inbox, and analyze performance — all from a mobile-friendly web app.

## Feature Modules

### A. Dashboard (Home)
Real-time KPI metrics: total leads this month, leads converted to appointments, appointment confirmation rate, no-show rate, revenue influenced by AI. Recent activity feed (new lead captured, appointment booked, SMS/email sent, review requested). Quick actions: Add New Treatment, View Recent Leads, Export This Month's Data.

### B. Lead Management
Lead list with filters by status (New / Contacted / Booked / Converted / Lost), date range, and treatment type. Lead detail page: name, phone, email, source (Google Ads, Facebook, Website, etc.), treatment requested, full SMS + email message history with timestamps, appointment history, and editable staff notes. Actions: manually create lead, import from CSV, export to CSV, mark as Booked or Converted.

### C. Appointment Management
Calendar views: monthly, weekly, and daily. Appointment detail: patient name/phone/email, treatment type, date/time, status (Confirmed / Pending / Cancelled / No-Show), and notes. Actions: create manually, confirm/cancel, reschedule, mark as no-show, send reminder SMS/email manually.

### D. AI Automation Settings (n8n Workflows)
Four configurable workflows, each with an on/off toggle, customizable SMS + email message templates, and a user-configured n8n webhook endpoint:
1. **Lead Follow-Up** — 3–7 step sequence; configurable timing between steps (minutes to days)
2. **Appointment Reminder** — sends at 48h, 24h, and 2h before appointment
3. **Re-Engagement** — triggers at 90, 180, or 365 days since last treatment
4. **Review Request** — triggers at 1, 3, or 7 days after treatment

All workflows POST to user-configured n8n webhook URLs stored in Integration Settings.

### E. Messaging Center
Unified inbox for all SMS + email (inbound and outbound), filterable by date, patient, and treatment. Per-patient conversation thread view with ability to send SMS/email manually and see AI-generated messages. Full message template library: create, edit, and delete; usable in workflows or manual sends.

### F. Reporting & Analytics
Pre-built reports: Leads This Month, Conversion Rate by Treatment, No-Show Rate by Week, Revenue Influenced by AI. Custom report builder with date range and metric selection; export to CSV or PDF. Charts: line (leads over time), bar (conversion by treatment), pie (appointment status distribution).

### G. Billing & Settings
**Billing**: current plan (Starter / Growth / Pro), monthly charge, setup fee if applicable, payment history, upgrade/downgrade, cancellation.  
**Organization**: med spa name, address, phone, timezone, language.  
**Staff management**: add/remove staff members, assign roles (Owner or Staff).  
**Integrations**: Supabase webhook URLs, n8n webhook URLs, Twilio SMS/email credentials.  
**Account**: change password, email notification toggles, optional two-factor authentication.

## Tech Stack
- **Frontend**: React 18+ (TypeScript), Tailwind CSS + shadcn/ui components
- **Backend/DB/Auth**: Supabase (PostgreSQL, Row Level Security, Supabase Auth)
- **Automation**: n8n-compatible REST webhook integration
- **Messaging**: Twilio (SMS + email via user-configured credentials)
- **Hosting**: Vercel/Netlify (frontend), Supabase (backend)

## Design Principles
- Mobile-first, fully responsive, touch-friendly
- Role-based access control enforced via Supabase Row Level Security
- Premium, calm aesthetic — violet (#8B5CF6) + rose/pink (#EC4899) brand palette

## Pricing Tiers
- **Starter**: entry-level plan
- **Growth**: mid-tier plan
- **Pro**: full-featured plan

You are an expert full-stack developer. Build a production-ready, fully functional client dashboard app for med spa owners to manage their AI automation service ("Radiance AI"). The app must be built with React + Supabase + n8n-compatible backend logic, and be deployable as a mobile-friendly web app.
Core Requirements
1. Tech Stack
Frontend: React 18+ (TypeScript preferred, but JavaScript acceptable)
Backend/DB/Auth: Supabase (PostgreSQL, Row Level Security, Auth)
Automation: n8n-compatible webhook endpoints (REST API)
Styling: Tailwind CSS + shadcn/ui components (or similar clean component library)
Hosting: Vercel/Netlify for frontend, Supabase for backend
Mobile-first design (responsive, touch-friendly)
2. User Roles & Auth
Med Spa Owner (primary user): Full access to all features
Staff Member (optional): Limited access (e.g., view dashboard, no billing)
Authentication: Supabase Auth (email/password, optional OAuth)
Onboarding: Email verification + organization setup (med spa name, address, timezone)
3. Core Features (Must Be Fully Functional)
A. Dashboard (Home)
Real-time metrics:
Total leads this month
Leads converted to appointments
Appointment confirmation rate
No-show rate
Revenue influenced (if tracked)
Recent activity log:
New lead captured
Appointment booked
SMS/email sent
Review requested
Quick actions:
"Add New Treatment"
"View Recent Leads"
"Export This Month's Data"
B. Lead Management
Lead list with filters:
Status: New, Contacted, Booked, Converted, Lost
Date range
Treatment type
Lead details page:
Name, phone, email
Source (Google Ads, Facebook, Website, etc.)
Treatment requested
All messages (SMS + email) with timestamps
Appointment history
Notes (editable by staff)
Actions:
Manually create lead
Import leads from CSV
Export leads to CSV
Mark as "Booked" or "Converted"
C. Appointment Management
Appointment calendar (monthly/weekly/daily views)
Appointment details:
Patient name, phone, email
Treatment type
Date/time
Status: Confirmed, Pending, Cancelled, No-Show
Notes
Actions:
Create appointment manually
Confirm/cancel appointment
Reschedule appointment
Mark as no-show
Send reminder SMS/email manually
D. AI Automation Settings
Lead Follow-Up Workflow:
Toggle: On/Off
Customize message templates (SMS + email)
Set number of steps (3–7)
Set timing between steps (e.g., 5 min, 1 day, 3 days)
Appointment Reminder Workflow:
Toggle: On/Off
Reminder times: 48h, 24h, 2h before appointment
Customize message template
Re-Engagement Workflow:
Toggle: On/Off
Days since last treatment: 90, 180, 365
Customize message template
Review Request Workflow:
Toggle: On/Off
Days after treatment: 1, 3, 7
Customize message template
All workflows must call n8n webhooks (document webhook URLs in settings)
E. Messaging Center
Inbox view:
All SMS messages (inbound + outbound)
All emails (inbound + outbound)
Filter by date, patient, treatment
Patient chat view:
Conversation thread with a single patient
Send SMS/email manually
View AI-generated messages
Message templates:
Create/edit/delete custom templates
Use in workflows or manual sends
F. Reporting & Analytics
Pre-built reports:
"Leads This Month"
"Conversion Rate by Treatment"
"No-Show Rate by Week"
"Revenue Influenced by AI"
Custom report builder:
Select date range
Select metrics
Export as CSV/PDF
Charts:
Line chart: Leads over time
Bar chart: Conversion by treatment
Pie chart: Appointment status distribution
G. Billing & Settings
Billing page:
Current plan (Starter/Growth/Pro)
Monthly charge
Setup fee (if applicable)
Payment history
Upgrade/downgrade plan
Cancel subscription
Organization settings:
Med spa name, address, phone
Timezone, language
Staff management (add/remove staff, set roles)
Integration settings (Supabase webhook URLs, n8n webhook URLs, Twilio credentials, etc.)
Account settings:
Change password
Email notifications toggle
Two-factor authentication (optional)
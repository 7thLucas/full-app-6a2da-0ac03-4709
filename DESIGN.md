# Radiance AI — Design Guidelines

## Design Philosophy
Premium wellness meets sharp analytics. Think the serenity of a high-end spa brand combined with the clarity of a best-in-class dashboard. Generous whitespace, soft surfaces, confident typography, and restrained, purposeful color. Mobile-first in every decision.

## Color Palette
- **Primary / Brand**: Deep plum-rose `#7C3F58` — luxe, warm, feminine-leaning without being saccharine. Used for primary actions, active states, key accents.
- **Primary accent (lighter)**: Soft rose `#C98BA3` for hover/secondary emphasis.
- **Secondary / Glow**: Warm gold `#C9A227` — used sparingly for "revenue influenced" and premium/positive highlights.
- **Background**: Warm off-white `#FBF8F6` (app canvas) and pure white `#FFFFFF` (cards/surfaces).
- **Surface elevated**: White with a subtle warm shadow.
- **Text primary**: `#2A2024` (near-black warm).
- **Text secondary**: `#6B5E63` (muted warm gray).
- **Border / hairline**: `#ECE3E0`.
- **Semantic**:
  - Success / Converted: `#3F8F6B` (sage green)
  - Warning / Pending: `#C9A227` (gold)
  - Danger / No-show / Lost: `#C0556B` (muted rose-red)
  - Info / New: `#5B7BA8` (dusty blue)

## Status Color Mapping (Leads & Appointments)
- New: dusty blue `#5B7BA8`
- Contacted: gold `#C9A227`
- Booked / Pending: plum `#7C3F58`
- Confirmed / Converted: sage `#3F8F6B`
- Cancelled / Lost / No-Show: muted rose-red `#C0556B`
Always pair color with a text label and/or icon — never rely on color alone.

## Typography
- **Display / Headings**: A refined serif-adjacent or elegant sans (e.g., "Fraunces" or "Playfair Display" for big numbers/hero headings) to evoke the wellness/luxe feel. Use for metric values and page titles.
- **Body / UI**: "Inter" (or system sans) for everything functional — labels, tables, buttons, forms. Crisp and legible.
- **Scale (mobile-first)**:
  - Metric value (hero number): 32–40px, weight 600–700
  - Page title: 24px, weight 600
  - Section heading: 18px, weight 600
  - Body: 15–16px, weight 400
  - Caption / meta: 13px, weight 400, secondary color
- Generous line-height (1.4–1.6) for body.

## Layout & Spacing
- **Mobile-first**: design for ~390px width first. Single-column stacks, then expand to multi-column / sidebar on `md`+.
- **Bottom tab navigation on mobile** (Dashboard, Leads, Appointments, Messages, More) — thumb-reachable. Convert to a left sidebar on desktop.
- Base spacing unit: 4px. Common gaps: 12, 16, 20, 24.
- Page padding: 16px on mobile, 24–32px on desktop.
- Card-based layout: metrics and content live in rounded cards.

## Elevation & Surfaces
- Cards: white surface, `border-radius: 16px`, soft warm shadow `0 2px 12px rgba(124,63,88,0.06)`, 1px hairline border `#ECE3E0`.
- Avoid heavy/hard shadows. Elevation is gentle and warm, never harsh.
- Active/selected states use a soft plum tint background `rgba(124,63,88,0.08)`.

## Components
- **Metric cards**: large serif number, small caption label, optional trend indicator (▲ green / ▼ red) with % change. Revenue card gets a subtle gold accent.
- **Status pills**: rounded-full, tinted background + matching text color, 13px, with optional leading dot/icon.
- **Buttons**: Primary = solid plum, white text, rounded-xl (12px), comfortable touch target (min 44px height). Secondary = outline plum. Ghost/text for tertiary.
- **Lists / rows**: tappable rows with clear hierarchy (name bold, meta secondary), chevron affordance, generous tap height (min 56px).
- **Forms**: large rounded inputs, clear labels above fields, focus ring in plum.
- **Charts**: clean, minimal axes, brand-tinted series (plum primary, gold/sage accents). Line for trends, bar for comparisons, pie/donut for distribution.
- **Calendar**: clean month grid with dot indicators for appointment density; tap a day to see details.
- **Empty states**: warm, encouraging copy with a single clear CTA.

## Iconography
- Lightweight line icons (e.g., Lucide). Consistent stroke weight (~1.5px). Rounded line caps to match the soft aesthetic.

## Motion
- Subtle and calm. 150–250ms ease transitions for taps, toggles, and view changes. Toggle switches animate smoothly. No jarring or bouncy motion.

## Accessibility
- Maintain WCAG AA contrast for text. Never convey status by color alone (pair with labels/icons). Touch targets ≥44px. Respect reduced-motion preferences.
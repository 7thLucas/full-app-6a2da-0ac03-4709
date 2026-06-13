/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TPlan = {
  name: string;
  price: string;
  description?: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  tagline?: string;
  promise?: string;
  logoUrl: string;
  supportEmail?: string;
  currencySymbol?: string;
  brandColor: TBrandColor;
  showRevenueMetric?: boolean;
  plans?: TPlan[];
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "Radiance AI",
  tagline: "Your AI front desk that never sleeps",
  promise:
    "Capture leads, book appointments, remind patients, and win back lapsed clients — automatically.",
  logoUrl: "FILL_LOGO_URL_HERE",
  supportEmail: "support@radiance.ai",
  currencySymbol: "$",
  brandColor: {
    primary: "#7C3F58",
    secondary: "#C9A227",
    accent: "#F1E5EA",
  },
  showRevenueMetric: true,
  plans: [
    { name: "Starter", price: "$199/mo", description: "For new med spas getting started with automation." },
    { name: "Growth", price: "$399/mo", description: "For growing practices scaling lead conversion." },
    { name: "Pro", price: "$699/mo", description: "For multi-provider spas that want it all." },
  ],
};

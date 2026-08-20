export interface SectorFieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "date";
  options?: string[];
  required?: boolean;
}

export interface SectorConfig {
  key: string;
  name: string;
  icon: string;
  isActive: boolean;
  fields: SectorFieldDef[];
}

export const ACTIVE_SECTORS: SectorConfig[] = [
  {
    key: "electricity",
    name: "Electricity",
    icon: "Zap",
    isActive: true,
    fields: [
      {
        key: "type",
        label: "Update Type",
        type: "select",
        options: [
          "Power outage",
          "Transformer fault",
          "Scheduled maintenance",
          "New connection",
          "Power restoration",
        ],
        required: true,
      },
      {
        key: "affectedHouseholds",
        label: "Affected Households (est.)",
        type: "number",
        required: false,
      },
      { key: "parish", label: "Parish", type: "text", required: false },
    ],
  },
  {
    key: "roads",
    name: "Roads",
    icon: "Route",
    isActive: true,
    fields: [
      {
        key: "type",
        label: "Update Type",
        type: "select",
        options: [
          "Construction",
          "Repair",
          "Maintenance",
          "Bridge construction",
          "Closure",
        ],
        required: true,
      },
      { key: "roadName", label: "Road Name", type: "text", required: false },
      {
        key: "distanceKm",
        label: "Distance (km)",
        type: "number",
        required: false,
      },
    ],
  },
  {
    key: "water",
    name: "Water",
    icon: "Droplets",
    isActive: true,
    fields: [
      {
        key: "type",
        label: "Update Type",
        type: "select",
        options: [
          "Supply interruption",
          "Borehole repair",
          "New connection",
          "Pipeline maintenance",
          "Quality inspection",
        ],
        required: true,
      },
      {
        key: "expectedCompletion",
        label: "Expected Completion",
        type: "date",
        required: false,
      },
    ],
  },
  {
    key: "health",
    name: "Health",
    icon: "HeartPulse",
    isActive: true,
    fields: [
      {
        key: "type",
        label: "Update Type",
        type: "select",
        options: [
          "Immunization campaign",
          "Disease outbreak",
          "Health center upgrade",
          "Medical outreach",
          "Public health notice",
        ],
        required: true,
      },
      {
        key: "targetPopulation",
        label: "Target Population",
        type: "text",
        required: false,
      },
      {
        key: "dateRangeStart",
        label: "Date Range Start",
        type: "date",
        required: false,
      },
      {
        key: "dateRangeEnd",
        label: "Date Range End",
        type: "date",
        required: false,
      },
    ],
  },
  {
    key: "education",
    name: "Education",
    icon: "GraduationCap",
    isActive: true,
    fields: [
      {
        key: "type",
        label: "Update Type",
        type: "select",
        options: [
          "School construction",
          "Classroom renovation",
          "Teacher recruitment",
          "Examination activity",
          "School inspection",
        ],
        required: true,
      },
      { key: "schoolName", label: "School Name", type: "text", required: true },
    ],
  },
  {
    key: "land",
    name: "Land",
    icon: "Mountain",
    isActive: true,
    fields: [
      {
        key: "type",
        label: "Update Type",
        type: "select",
        options: [
          "Registration",
          "Boundary dispute",
          "Land allocation",
          "Survey",
          "Community sensitization",
        ],
        required: true,
      },
      {
        key: "partiesInvolved",
        label: "Parties Involved",
        type: "text",
        required: false,
      },
    ],
  },
];

export const FUTURE_SECTORS: SectorConfig[] = [
  { key: "agriculture", name: "Agriculture", icon: "🌾", isActive: false, fields: [] },
  { key: "security", name: "Security", icon: "🛡️", isActive: false, fields: [] },
  { key: "trade", name: "Trade and Commerce", icon: "🏪", isActive: false, fields: [] },
  { key: "environment", name: "Environment", icon: "🌿", isActive: false, fields: [] },
  { key: "community", name: "Community Development", icon: "🏘️", isActive: false, fields: [] },
  { key: "forestry", name: "Forestry", icon: "🌲", isActive: false, fields: [] },
  { key: "youth", name: "Youth Affairs", icon: "👥", isActive: false, fields: [] },
  { key: "gender", name: "Gender Services", icon: "♀️", isActive: false, fields: [] },
  { key: "disaster", name: "Disaster Management", icon: "🚨", isActive: false, fields: [] },
  { key: "tourism", name: "Tourism", icon: "🏛️", isActive: false, fields: [] },
];

export function getSectorConfig(key: string): SectorConfig | undefined {
  return ACTIVE_SECTORS.find((s) => s.key === key);
}

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  needs_correction: "Needs Correction",
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export type UserRole = "admin" | "officer";

export interface DemoUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  sector: string | null; // sector key e.g. "electricity"
  redirectTo: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: "user-admin",
    name: "District Administrator",
    username: "admin",
    role: "admin",
    sector: null,
    redirectTo: "/admin",
  },
  {
    id: "user-electricity",
    name: "Electricity Officer",
    username: "electricity.officer",
    role: "officer",
    sector: "electricity",
    redirectTo: "/officer/electricity",
  },
  {
    id: "user-roads",
    name: "Roads Officer",
    username: "roads.officer",
    role: "officer",
    sector: "roads",
    redirectTo: "/officer/roads",
  },
  {
    id: "user-water",
    name: "Water Officer",
    username: "water.officer",
    role: "officer",
    sector: "water",
    redirectTo: "/officer/water",
  },
  {
    id: "user-health",
    name: "Health Officer",
    username: "health.officer",
    role: "officer",
    sector: "health",
    redirectTo: "/officer/health",
  },
  {
    id: "user-education",
    name: "Education Officer",
    username: "education.officer",
    role: "officer",
    sector: "education",
    redirectTo: "/officer/education",
  },
  {
    id: "user-land",
    name: "Land Officer",
    username: "land.officer",
    role: "officer",
    sector: "land",
    redirectTo: "/officer/land",
  },
];

const CREDENTIALS: Record<string, string> = {
  admin: "admin123",
  "electricity.officer": "demo123",
  "roads.officer": "demo123",
  "water.officer": "demo123",
  "health.officer": "demo123",
  "education.officer": "demo123",
  "land.officer": "demo123",
};

export function validateCredentials(
  username: string,
  password: string
): DemoUser | null {
  const expectedPassword = CREDENTIALS[username];
  if (!expectedPassword || expectedPassword !== password) return null;
  return DEMO_USERS.find((u) => u.username === username) ?? null;
}

export function getUserById(id: string): DemoUser | null {
  return DEMO_USERS.find((u) => u.id === id) ?? null;
}

export const SESSION_COOKIE = "lira_session";

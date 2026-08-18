import { cookies } from "next/headers";
import { DemoUser, getUserById, SESSION_COOKIE } from "./auth";

export async function getCurrentUser(): Promise<DemoUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  if (!sessionCookie?.value) return null;
  try {
    const { userId } = JSON.parse(sessionCookie.value);
    return getUserById(userId);
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<DemoUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin(): Promise<DemoUser> {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireOfficer(sector?: string): Promise<DemoUser> {
  const user = await requireUser();
  if (user.role !== "officer") {
    throw new Error("FORBIDDEN");
  }
  if (sector && user.sector !== sector) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

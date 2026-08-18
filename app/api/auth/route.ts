import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateCredentials, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const user = validateCredentials(username?.trim(), password);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 }
    );
  }

  const sessionData = JSON.stringify({ userId: user.id });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionData, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24h
  });

  return NextResponse.json({ redirectTo: user.redirectTo, name: user.name });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}

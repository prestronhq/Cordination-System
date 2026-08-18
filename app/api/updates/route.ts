import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "officer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, location, priority, sectorKey, sectorFields } = body;

  if (!title || !description || !location) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (sectorKey !== user.sector) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sector = await prisma.sector.findUnique({ where: { key: sectorKey } });
  if (!sector) {
    return NextResponse.json({ error: "Sector not found" }, { status: 404 });
  }

  const update = await prisma.update.create({
    data: {
      sectorId: sector.id,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      priority: priority ?? "medium",
      status: "pending",
      sectorFields: JSON.stringify(sectorFields ?? {}),
      attachments: "[]",
      submittedById: user.id,
    },
  });

  return NextResponse.json(update, { status: 201 });
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sectorKey = searchParams.get("sector");
  const status = searchParams.get("status");

  if (user.role === "officer") {
    // Officers can only see their own sector's updates
    const updates = await prisma.update.findMany({
      where: {
        submittedById: user.id,
        ...(status ? { status } : {}),
      },
      orderBy: { submittedAt: "desc" },
      include: { sector: true },
    });
    return NextResponse.json(updates);
  }

  if (user.role === "admin") {
    const updates = await prisma.update.findMany({
      where: {
        ...(sectorKey ? { sector: { key: sectorKey } } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { submittedAt: "desc" },
      include: { sector: true },
    });
    return NextResponse.json(updates);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

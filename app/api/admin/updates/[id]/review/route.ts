import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { action, comment } = await request.json();

  if (!["approve", "reject", "needs_correction"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const update = await prisma.update.findUnique({ where: { id } });
  if (!update) {
    return NextResponse.json({ error: "Update not found" }, { status: 404 });
  }

  const now = new Date();
  const statusMap: Record<string, string> = {
    approve: "approved",
    reject: "rejected",
    needs_correction: "needs_correction",
  };

  const updated = await prisma.update.update({
    where: { id },
    data: {
      status: statusMap[action],
      reviewedById: user.id,
      reviewedAt: now,
      reviewComment: comment || null,
      publishedAt: action === "approve" ? now : undefined,
    },
    include: { sector: true },
  });

  return NextResponse.json(updated);
}

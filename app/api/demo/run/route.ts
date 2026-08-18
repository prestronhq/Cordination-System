import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

/**
 * POST /api/demo/run
 * Creates a fresh "Transformer Fault at Bar Ogole" electricity update
 * in pending state, ready to be approved live in the demo.
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const sector = await prisma.sector.findUnique({ where: { key: "electricity" } });
  if (!sector) {
    return NextResponse.json({ error: "Electricity sector not found." }, { status: 404 });
  }

  // Create a fresh demo update (so every demo run has a new one to approve)
  const update = await prisma.update.create({
    data: {
      sectorId: sector.id,
      title: "Transformer Fault at Bar Ogole — DEMO",
      description:
        "A transformer serving Bar Ogole trading centre has developed a fault, resulting in loss of power to approximately 340 households in the surrounding area. UMEME technicians have been notified and an assessment team is en route. Estimated restoration within 8 hours pending parts availability.",
      location: "Bar Ogole, Erute County",
      priority: "high",
      status: "pending",
      sectorFields: JSON.stringify({
        type: "Transformer fault",
        affectedHouseholds: "340",
        parish: "Bar Ogole Parish",
      }),
      attachments: "[]",
      submittedById: "user-electricity",
    },
  });

  return NextResponse.json({
    message: `Demo update created (ID: ${update.id.slice(0, 8)}…). Go to Review Queue to approve it.`,
    updateId: update.id,
  });
}

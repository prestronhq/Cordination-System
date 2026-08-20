import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getSectorConfig, STATUS_LABELS } from "@/lib/sectors";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, LucideFileText } from "@/lib/icons";
import { formatDateTime } from "@/lib/utils";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OfficerDashboard({
  params,
}: {
  params: Promise<{ sector: string }>;
}) {
  const { sector } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sectorConfig = getSectorConfig(sector);

  // Count by status
  const updates = await prisma.update.findMany({
    where: { sector: { key: sector }, submittedById: user.id },
    orderBy: { submittedAt: "desc" },
    include: { sector: true },
  });

  const counts = {
    pending: updates.filter((u) => u.status === "pending").length,
    approved: updates.filter((u) => u.status === "approved").length,
    rejected: updates.filter((u) => u.status === "rejected").length,
    needs_correction: updates.filter((u) => u.status === "needs_correction").length,
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{sectorConfig?.icon}</span>
            <h1 className="text-2xl font-bold text-text-strong">
              {sectorConfig?.name} Sector
            </h1>
          </div>
          <p className="text-text-muted text-sm">Your submitted updates and their review status.</p>
        </div>
        <Button asChild>
          <Link href={`/officer/${sector}/submit`}>
            <PlusCircle className="w-4 h-4" />
            New Update
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {(["pending", "approved", "needs_correction", "rejected"] as const).map((status) => (
          <Card key={status} className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-text-strong">{counts[status]}</div>
              <div className="text-xs text-text-muted mt-1">{STATUS_LABELS[status]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Updates list */}
      {updates.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <LucideFileText className="w-12 h-12 text-border-strong mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-default mb-2">No updates yet</h3>
            <p className="text-text-muted text-sm mb-6">
              Submit your first update to get started.
            </p>
            <Button asChild>
              <Link href={`/officer/${sector}/submit`}>
                <PlusCircle className="w-4 h-4" />
                Submit an Update
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {updates.map((update) => (
            <Link key={update.id} href={`/officer/${sector}/update/${update.id}`}>
              <Card className="hover:shadow-md hover:border-primary-200 transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <StatusBadge status={update.status} />
                        <PriorityBadge priority={update.priority} />
                      </div>
                      <h3 className="font-semibold text-text-strong truncate">{update.title}</h3>
                      <p className="text-sm text-text-muted mt-0.5">
                        {update.location} · Submitted {formatDateTime(update.submittedAt)}
                      </p>
                      {(update.status === "rejected" || update.status === "needs_correction") &&
                        update.reviewComment && (
                          <p className="text-sm text-amber-700 mt-1 line-clamp-1">
                            Admin note: {update.reviewComment}
                          </p>
                        )}
                    </div>
                    <span className="text-text-subtle text-lg flex-shrink-0">›</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

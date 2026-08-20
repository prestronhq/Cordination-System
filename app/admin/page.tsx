import { SectorIcon } from "@/components/SectorIcon";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ACTIVE_SECTORS, FUTURE_SECTORS } from "@/lib/sectors";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, CircleCheck, Clock, TriangleAlert, CirclePlay } from "@/lib/icons";
import { timeAgo } from "@/lib/utils";
import { DemoScenarioButton } from "./DemoScenarioButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, pending, published, thisMonth, recent, sectorCounts] =
    await Promise.all([
      prisma.update.count(),
      prisma.update.count({ where: { status: "pending" } }),
      prisma.update.count({ where: { status: "approved" } }),
      prisma.update.count({
        where: { status: "approved", publishedAt: { gte: startOfMonth } },
      }),
      prisma.update.findMany({
        orderBy: { submittedAt: "desc" },
        take: 8,
        include: { sector: true },
      }),
      prisma.update.groupBy({
        by: ["sectorId"],
        _count: { id: true },
        where: { status: "pending" },
      }),
    ]);

  // Enrich sector counts
  const sectorMap = await prisma.sector.findMany();
  const enrichedSectorCounts = sectorCounts.map((sc) => {
    const sector = sectorMap.find((s) => s.id === sc.sectorId);
    return {
      sectorId: sc.sectorId,
      sectorName: sector?.name ?? "Unknown",
      sectorIcon: sector?.icon ?? "❓",
      sectorKey: sector?.key ?? "",
      count: sc._count.id,
    };
  });

  return { total, pending, published, thisMonth, recent, enrichedSectorCounts };
}

export default async function AdminDashboard() {
  const { total, pending, published, thisMonth, recent, enrichedSectorCounts } =
    await getDashboardData();

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-strong">District Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">
            Overview of all sector updates and pending approvals.
          </p>
        </div>
        <div className="flex gap-2">
          <DemoScenarioButton />
          <Button asChild>
            <Link href="/admin/review">
              <ClipboardList className="w-4 h-4" />
              Review Queue {pending > 0 && `(${pending})`}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-muted">Total Updates</span>
              <ClipboardList className="w-4 h-4 text-text-subtle" />
            </div>
            <div className="text-3xl font-bold text-text-strong">{total}</div>
          </CardContent>
        </Card>
        <Card className="border-warning-200 bg-warning-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-warning-700">Pending Review</span>
              <Clock className="w-4 h-4 text-warning-500" />
            </div>
            <div className="text-3xl font-bold text-warning-800">{pending}</div>
          </CardContent>
        </Card>
        <Card className="border-secondary-200 bg-secondary-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-secondary-700">Published</span>
              <CircleCheck className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-secondary-800">{published}</div>
          </CardContent>
        </Card>
        <Card className="border-primary-200 bg-primary-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-primary-700">This Month</span>
              <TriangleAlert className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-primary-800">{thisMonth}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <Link href="/admin/review" className="text-sm text-primary-700 hover:underline">
                  View all →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recent.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-8">No updates yet.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recent.map((update) => (
                    <Link
                      key={update.id}
                      href={`/admin/review/${update.id}`}
                      className="flex items-start gap-3 px-5 py-3.5 hover:bg-surface-1 transition-colors"
                    >
                      <SectorIcon iconKey={update.sector.icon} className="size-8 p-1.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-text-strong truncate">
                            {update.title}
                          </span>
                          <StatusBadge status={update.status} />
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">
                          {update.sector.name} · {update.location} · {timeAgo(update.submittedAt)}
                        </p>
                      </div>
                      <PriorityBadge priority={update.priority} className="flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending by sector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending by Sector</CardTitle>
            </CardHeader>
            <CardContent>
              {enrichedSectorCounts.length === 0 ? (
                <p className="text-text-muted text-sm">No pending updates.</p>
              ) : (
                <div className="space-y-2">
                  {enrichedSectorCounts
                    .sort((a, b) => b.count - a.count)
                    .map((sc) => (
                      <Link
                        key={sc.sectorId}
                        href={`/admin/review?sector=${sc.sectorKey}`}
                        className="flex items-center justify-between py-1.5 hover:text-primary-700 transition-colors"
                      >
                        <span className="flex items-center gap-2 text-sm">
                          <SectorIcon iconKey={sc.sectorIcon} className="size-4 p-0 bg-transparent text-current" />
                          <span className="text-text-default">{sc.sectorName}</span>
                        </span>
                        <span className="bg-warning-100 text-warning-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {sc.count}
                        </span>
                      </Link>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sectors overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Sectors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {ACTIVE_SECTORS.map((s) => (
                <div key={s.key} className="flex items-center gap-2 py-1">
                  <SectorIcon iconKey={s.icon} className="size-4 p-0 bg-transparent text-current" />
                  <span className="text-sm text-text-default">{s.name}</span>
                  <span className="ml-auto text-xs bg-secondary-100 text-secondary-700 px-1.5 py-0.5 rounded">
                    Active
                  </span>
                </div>
              ))}
              {FUTURE_SECTORS.slice(0, 4).map((s) => (
                <div key={s.key} className="flex items-center gap-2 py-1 opacity-50">
                  <SectorIcon iconKey={s.icon} className="size-4 p-0 bg-transparent text-current" />
                  <span className="text-sm text-text-subtle">{s.name}</span>
                  <span className="ml-auto text-xs bg-surface-2 text-text-subtle px-1.5 py-0.5 rounded">
                    Coming soon
                  </span>
                </div>
              ))}
              <p className="text-xs text-text-subtle mt-2">
                +{FUTURE_SECTORS.length - 4} more sectors planned
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

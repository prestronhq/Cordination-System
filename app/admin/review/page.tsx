import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ACTIVE_SECTORS } from "@/lib/sectors";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string; priority?: string }>;
}) {
  const sp = await searchParams;
  const sectorFilter = sp.sector ?? "";
  const priorityFilter = sp.priority ?? "";

  const updates = await prisma.update.findMany({
    where: {
      status: { in: ["pending", "needs_correction"] },
      ...(sectorFilter ? { sector: { key: sectorFilter } } : {}),
      ...(priorityFilter ? { priority: priorityFilter } : {}),
    },
    orderBy: [{ priority: "desc" }, { submittedAt: "asc" }],
    include: { sector: true },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Review Queue</h1>
        <p className="text-gray-500 text-sm mt-1">
          {updates.length} update{updates.length !== 1 ? "s" : ""} awaiting review
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm text-gray-600 font-medium">Filter:</span>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/review"
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  !sectorFilter && !priorityFilter
                    ? "bg-blue-900 text-white border-blue-900"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                }`}
              >
                All
              </Link>
              {ACTIVE_SECTORS.map((s) => (
                <Link
                  key={s.key}
                  href={`/admin/review?sector=${s.key}`}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${
                    sectorFilter === s.key
                      ? "bg-blue-900 text-white border-blue-900"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  <span>{s.icon}</span>
                  {s.name}
                </Link>
              ))}
              <Link
                href="/admin/review?priority=high"
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  priorityFilter === "high"
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-red-400"
                }`}
              >
                High Priority
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {updates.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <p className="text-lg font-semibold text-gray-700 mb-2">Queue is empty</p>
            <p className="text-gray-500 text-sm">
              {sectorFilter
                ? "No pending updates for this sector."
                : "All updates have been reviewed."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {updates.map((update) => (
            <Link key={update.id} href={`/admin/review/${update.id}`}>
              <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl flex-shrink-0 mt-1">{update.sector.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <StatusBadge status={update.status} />
                        <PriorityBadge priority={update.priority} />
                        <span className="text-xs text-gray-500">{update.sector.name}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{update.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                        {update.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {update.location} · Submitted {formatDateTime(update.submittedAt)}
                      </p>
                    </div>
                    <span className="text-gray-400 text-lg flex-shrink-0">›</span>
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

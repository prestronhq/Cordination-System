import { SectorIcon } from "@/components/SectorIcon";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ACTIVE_SECTORS } from "@/lib/sectors";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    sector?: string;
    status?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const sectorFilter = sp.sector ?? "";
  const statusFilter = sp.status ?? "";

  const where: Prisma.UpdateWhereInput = {
    ...(sectorFilter ? { sector: { key: sectorFilter } } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { location: { contains: q } },
          ],
        }
      : {}),
  };

  const updates = q || sectorFilter || statusFilter
    ? await prisma.update.findMany({
        where,
        orderBy: { submittedAt: "desc" },
        take: 50,
        include: { sector: true },
      })
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-strong">Search All Updates</h1>
        <p className="text-text-muted text-sm mt-1">
          Search across all sectors, locations, and keywords.
        </p>
      </div>

      {/* Search form */}
      <form className="bg-white border border-border-default rounded-lg p-4 mb-6 space-y-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search keywords, title, location…"
              className="w-full h-9 px-3 rounded-md border border-border-strong text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
          <select
            name="sector"
            defaultValue={sectorFilter}
            className="h-9 px-3 rounded-md border border-border-strong text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
          >
            <option value="">All Sectors</option>
            {ACTIVE_SECTORS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={statusFilter}
            className="h-9 px-3 rounded-md border border-border-strong text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="needs_correction">Needs Correction</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Results */}
      {!q && !sectorFilter && !statusFilter ? (
        <div className="text-center py-16 text-text-subtle">
          <p className="text-lg">Enter a search term or apply a filter.</p>
        </div>
      ) : updates.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-text-muted">No results found.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-text-muted mb-3">{updates.length} result{updates.length !== 1 ? "s" : ""}</p>
          <div className="space-y-3">
            {updates.map((update) => (
              <Link key={update.id} href={`/admin/review/${update.id}`}>
                <Card className="hover:shadow-md hover:border-primary-200 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <SectorIcon iconKey={update.sector.icon} className="size-8 p-1.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <StatusBadge status={update.status} />
                          <PriorityBadge priority={update.priority} />
                          <span className="text-xs text-text-subtle">{update.sector.name}</span>
                        </div>
                        <h3 className="font-semibold text-text-strong">{update.title}</h3>
                        <p className="text-xs text-text-muted mt-0.5">
                          {update.location} · {formatDateTime(update.submittedAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

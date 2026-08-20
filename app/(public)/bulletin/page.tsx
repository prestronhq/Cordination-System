import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ACTIVE_SECTORS } from "@/lib/sectors";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";
import { MapPin, Calendar } from "@/lib/icons";
import { SectorIcon } from "@/components/SectorIcon";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PublicBulletinPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string; q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const sectorFilter = resolvedSearchParams.sector;
  const q = resolvedSearchParams.q;

  const where: any = { status: "approved" };
  if (sectorFilter) {
    where.sector = { key: sectorFilter };
  }
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { location: { contains: q } },
    ];
  }

  const updates = await prisma.update.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    include: { sector: true },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-h1 text-text-strong mb-2">District Bulletin</h1>
        <p className="text-text-muted">
          Official approved updates from all district sectors.
          {updates.length > 0 && ` Showing ${updates.length} update${updates.length !== 1 ? "s" : ""}.`}
        </p>
      </div>

      {/* Filters */}
      <form className="bg-surface-0 border border-border-default rounded-xl p-4 mb-8 shadow-sm">
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by keyword or location…"
            className="h-10 px-3 rounded-md border border-border-default bg-surface-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600"
          />
          <select
            name="sector"
            defaultValue={sectorFilter}
            className="h-10 px-3 rounded-md border border-border-default bg-surface-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600"
          >
            <option value="">All Sectors</option>
            {ACTIVE_SECTORS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Filter
            </Button>
            {(sectorFilter || q) && (
              <Button asChild variant="outline">
                <Link href="/bulletin">Clear</Link>
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Sector quick-filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/bulletin"
          className={`text-sm px-4 py-2 rounded-full border transition-all ${
            !sectorFilter
              ? "bg-primary-600 text-white border-primary-600 shadow-sm"
              : "bg-surface-0 text-text-default border-border-default hover:border-primary-300"
          }`}
        >
          All
        </Link>
        {ACTIVE_SECTORS.map((s) => (
          <Link
            key={s.key}
            href={`/bulletin?sector=${s.key}`}
            className={`text-sm px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${
              sectorFilter === s.key
                ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                : "bg-surface-0 text-text-default border-border-default hover:border-primary-300"
            }`}
          >
            <SectorIcon 
              iconKey={s.icon} 
              className={`size-5 p-0 bg-transparent ${sectorFilter === s.key ? "text-white" : "text-primary-600"}`} 
            />
            {s.name}
          </Link>
        ))}
      </div>

      {updates.length === 0 ? (
        <div className="text-center py-20 bg-surface-0 border border-border-default rounded-xl">
          <p className="text-lg text-text-muted mb-2">No approved updates found.</p>
          {(sectorFilter || q) && (
            <Link href="/bulletin" className="text-primary-600 hover:underline text-sm font-medium">
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <div key={update.id} className="relative flex group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-100 group-hover:bg-primary-500 transition-colors rounded-l-xl z-10" />
              <Card variant="hover" className="flex-1 border-l-0 rounded-l-none pl-1">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <SectorIcon iconKey={update.sector.icon} className="size-12 p-2.5 rounded-lg flex-shrink-0 mt-0.5 hidden sm:flex" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-overline text-text-muted">
                          {update.sector.name}
                        </span>
                        <StatusBadge status={update.status} />
                      </div>
                      <Link href={`/bulletin/${update.id}`}>
                        <h2 className="text-h3 text-text-strong hover:text-primary-700 leading-snug mb-1.5">
                          {update.title}
                        </h2>
                      </Link>
                      <p className="text-body text-text-default mt-1 line-clamp-2">
                        {update.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-caption text-text-muted mt-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {update.location}
                        </span>
                        {update.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3.5" />
                            {formatDate(update.publishedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/bulletin/${update.id}`}
                      className="text-primary-600 text-sm font-medium hover:underline flex-shrink-0 hidden md:block"
                    >
                      Read more →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

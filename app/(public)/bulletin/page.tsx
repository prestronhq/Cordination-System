import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ACTIVE_SECTORS } from "@/lib/sectors";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BulletinPage({
  searchParams,
}: {
  searchParams: Promise<{
    sector?: string;
    q?: string;
    type?: string;
  }>;
}) {
  const sp = await searchParams;
  const sectorFilter = sp.sector ?? "";
  const q = sp.q ?? "";
  const typeFilter = sp.type ?? "";

  // IMPORTANT: Always filter to approved-only at the query level
  const where: Prisma.UpdateWhereInput = {
    status: "approved", // hard-coded, never removed
    ...(sectorFilter ? { sector: { key: sectorFilter } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { location: { contains: q } },
          ],
        }
      : {}),
    ...(typeFilter
      ? { sectorFields: { contains: typeFilter } }
      : {}),
  };

  const updates = await prisma.update.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    include: { sector: true },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Public Bulletin</h1>
        <p className="text-gray-500">
          Official approved updates from all district sectors.
          {updates.length > 0 && ` Showing ${updates.length} update${updates.length !== 1 ? "s" : ""}.`}
        </p>
      </div>

      {/* Filters */}
      <form className="bg-white border border-gray-200 rounded-lg p-4 mb-8">
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by keyword or location…"
            className="h-9 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
          <select
            name="sector"
            defaultValue={sectorFilter}
            className="h-9 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
          >
            <option value="">All Sectors</option>
            {ACTIVE_SECTORS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800"
            >
              Filter
            </button>
            {(sectorFilter || q) && (
              <Link
                href="/bulletin"
                className="px-4 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-50 flex items-center"
              >
                Clear
              </Link>
            )}
          </div>
        </div>
      </form>

      {/* Sector quick-filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/bulletin"
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !sectorFilter
              ? "bg-blue-900 text-white border-blue-900"
              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
          }`}
        >
          All
        </Link>
        {ACTIVE_SECTORS.map((s) => (
          <Link
            key={s.key}
            href={`/bulletin?sector=${s.key}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${
              sectorFilter === s.key
                ? "bg-blue-900 text-white border-blue-900"
                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
            }`}
          >
            <span>{s.icon}</span>
            {s.name}
          </Link>
        ))}
      </div>

      {updates.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-400 mb-2">No approved updates found.</p>
          {(sectorFilter || q) && (
            <Link href="/bulletin" className="text-blue-700 hover:underline text-sm">
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <Card key={update.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{update.sector.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {update.sector.name}
                      </span>
                      <StatusBadge status={update.status} />
                    </div>
                    <Link href={`/bulletin/${update.id}`}>
                      <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-800 leading-snug">
                        {update.title}
                      </h2>
                    </Link>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {update.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      📍 {update.location}
                      {update.publishedAt && (
                        <> · Published {formatDate(update.publishedAt)}</>
                      )}
                    </p>
                  </div>
                  <Link
                    href={`/bulletin/${update.id}`}
                    className="text-blue-700 text-sm hover:underline flex-shrink-0 hidden sm:block"
                  >
                    Read more →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

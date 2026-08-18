import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { ACTIVE_SECTORS } from "@/lib/sectors";
import { formatDate, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getPublicStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalPublished, thisMonth, recentUpdates] = await Promise.all([
    prisma.update.count({ where: { status: "approved" } }),
    prisma.update.count({
      where: { status: "approved", publishedAt: { gte: startOfMonth } },
    }),
    prisma.update.findMany({
      where: { status: "approved" },
      orderBy: { publishedAt: "desc" },
      take: 6,
      include: { sector: true },
    }),
  ]);

  return { totalPublished, thisMonth, recentUpdates };
}

export default async function HomePage() {
  const { totalPublished, thisMonth, recentUpdates } = await getPublicStats();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5282] text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-5xl mb-4">🏛️</div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
            Lira District Sector Coordination Platform
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto mb-8">
            Official public information portal for district sector activities — 
            Electricity, Roads, Water, Health, Education, and Land.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-[#1e3a5f] hover:bg-blue-50 font-semibold">
              <Link href="/bulletin">View Public Bulletin</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 bg-transparent">
              <Link href="/login">Officer / Admin Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#2d6a4f] text-white py-5">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-8 text-center">
          <div>
            <div className="text-2xl font-bold">{totalPublished}</div>
            <div className="text-green-200 text-sm">Total Updates Published</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{thisMonth}</div>
            <div className="text-green-200 text-sm">Updates This Month</div>
          </div>
          <div>
            <div className="text-2xl font-bold">6</div>
            <div className="text-green-200 text-sm">Active Sectors</div>
          </div>
        </div>
      </section>

      {/* Sectors grid */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">District Sectors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {ACTIVE_SECTORS.map((sector) => (
            <Link
              key={sector.key}
              href={`/bulletin?sector=${sector.key}`}
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-center"
            >
              <span className="text-3xl">{sector.icon}</span>
              <span className="text-sm font-medium text-gray-700">{sector.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent updates */}
      {recentUpdates.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent District Updates</h2>
            <Link href="/bulletin" className="text-sm text-blue-700 hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentUpdates.map((update) => (
              <Card key={update.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-lg">{update.sector.icon}</span>
                    <StatusBadge status={update.status} />
                  </div>
                  <Link href={`/bulletin/${update.id}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-blue-800 line-clamp-2 mb-1 leading-snug">
                      {update.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-500">
                    {update.location} · {update.publishedAt ? timeAgo(update.publishedAt) : ""}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {!recentUpdates.length && (
        <section className="max-w-5xl mx-auto px-4 pb-12 text-center py-12 text-gray-500">
          <p className="text-lg">No updates have been published yet.</p>
          <p className="text-sm mt-1">Check back soon for district sector news.</p>
        </section>
      )}
    </div>
  );
}

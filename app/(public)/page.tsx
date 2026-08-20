import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { ACTIVE_SECTORS } from "@/lib/sectors";
import { formatDate, timeAgo } from "@/lib/utils";
import Image from "next/image";
import { SectorIcon } from "@/components/SectorIcon";

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
      <section className="bg-gradient-to-br from-surface-inverse to-primary-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-4 flex justify-center">
            <Image src="/logo.png" alt="Lira District Logo" width={64} height={64} />
          </div>
          <h1 className="text-display font-serif mb-3">
            Lira District Sector Coordination Platform
          </h1>
          <p className="text-text-on-inverse-muted text-lg max-w-2xl mx-auto mb-8">
            Official public information portal for district sector activities — 
            Electricity, Roads, Water, Health, Education, and Land.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary-900 hover:bg-surface-1 font-semibold">
              <Link href="/bulletin">View Public Bulletin</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
              <Link href="/login">Officer / Admin Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-secondary-600 text-white py-5">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center gap-12 text-center font-numeric">
          <div>
            <div className="text-h1">{totalPublished}</div>
            <div className="text-secondary-50 text-sm font-medium">Total Updates Published</div>
          </div>
          <div>
            <div className="text-h1">{thisMonth}</div>
            <div className="text-secondary-50 text-sm font-medium">Updates This Month</div>
          </div>
          <div>
            <div className="text-h1">6</div>
            <div className="text-secondary-50 text-sm font-medium">Active Sectors</div>
          </div>
        </div>
      </section>

      {/* Sectors grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-h2 text-text-strong mb-6 text-center">District Sectors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {ACTIVE_SECTORS.map((sector) => (
            <Link
              key={sector.key}
              href={`/bulletin?sector=${sector.key}`}
              className="flex flex-col items-center gap-3 p-5 rounded-xl bg-surface-0 border border-border-default hover:border-primary-300 hover:shadow-md transition-all text-center"
            >
              <SectorIcon iconKey={sector.icon} className="size-12 p-2.5 rounded-lg" />
              <span className="text-sm font-medium text-text-strong">{sector.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent updates */}
      {recentUpdates.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-h2 text-text-strong">Recent District Updates</h2>
            <Link href="/bulletin" className="text-sm text-primary-600 hover:underline font-medium">
              View all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentUpdates.map((update) => (
              <Card key={update.id} variant="hover">
                <CardContent tight className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <SectorIcon iconKey={update.sector.icon} className="size-8 p-1.5" />
                    <StatusBadge status={update.status} />
                  </div>
                  <Link href={`/bulletin/${update.id}`}>
                    <h3 className="text-h3 text-text-strong hover:text-primary-700 line-clamp-2 mb-1">
                      {update.title}
                    </h3>
                  </Link>
                  <p className="text-caption text-text-muted mt-2 flex items-center gap-1.5">
                    <span className="truncate max-w-[150px]">{update.location}</span>
                    <span>·</span>
                    <span>{update.publishedAt ? timeAgo(update.publishedAt) : ""}</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {!recentUpdates.length && (
        <section className="max-w-6xl mx-auto px-4 pb-12 text-center py-12 text-text-muted">
          <p className="text-lg">No updates have been published yet.</p>
          <p className="text-sm mt-1">Check back soon for district sector news.</p>
        </section>
      )}
    </div>
  );
}

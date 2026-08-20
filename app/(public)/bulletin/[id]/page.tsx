import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSectorConfig } from "@/lib/sectors";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Calendar } from "@/lib/icons";
import { formatDate } from "@/lib/utils";
import { SectorIcon } from "@/components/SectorIcon";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BulletinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Only approved updates visible — enforced at query level
  const update = await prisma.update.findFirst({
    where: { id, status: "approved" },
    include: { sector: true },
  });

  if (!update) notFound();

  const sectorConfig = getSectorConfig(update.sector.key);
  const sectorFields = JSON.parse(update.sectorFields || "{}");

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href="/bulletin"
        className="inline-flex items-center gap-1 text-sm font-medium text-text-muted hover:text-text-strong mb-6 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Public Bulletin
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <SectorIcon iconKey={update.sector.icon} className="size-10 p-2 rounded-lg" />
          <span className="text-overline text-text-muted">
            {update.sector.name}
          </span>
          <StatusBadge status={update.status} />
        </div>
        <h1 className="text-display font-serif text-text-strong mb-4">
          {update.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-small text-text-muted bg-surface-2 p-3 rounded-lg border border-border-default inline-flex">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 text-primary-500" />
            {update.location}
          </span>
          {update.publishedAt && (
            <>
              <span className="text-border-strong hidden sm:block">|</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4 text-primary-500" />
                Published {formatDate(update.publishedAt)}
              </span>
            </>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 sm:p-8">
          <p className="text-body text-text-strong leading-relaxed whitespace-pre-wrap">
            {update.description}
          </p>
        </CardContent>
      </Card>

      {sectorConfig && Object.keys(sectorFields).length > 0 && (
        <Card>
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-overline text-text-strong mb-5">
              Additional Details
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              {sectorConfig.fields.map((field) => {
                const val = sectorFields[field.key];
                if (!val) return null;
                return (
                  <div key={field.key} className="bg-surface-1 p-3 rounded-md border border-border-default">
                    <dt className="text-caption text-text-muted mb-1">
                      {field.label}
                    </dt>
                    <dd className="text-small font-medium text-text-strong">{val}</dd>
                  </div>
                );
              })}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

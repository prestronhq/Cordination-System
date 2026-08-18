import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSectorConfig } from "@/lib/sectors";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";

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
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Public Bulletin
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-3xl">{update.sector.icon}</span>
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {update.sector.name}
          </span>
          <StatusBadge status={update.status} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
          {update.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span>📍 {update.location}</span>
          {update.publishedAt && (
            <span>📅 Published {formatDate(update.publishedAt)}</span>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
            {update.description}
          </p>
        </CardContent>
      </Card>

      {sectorConfig && Object.keys(sectorFields).length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
              Additional Details
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sectorConfig.fields.map((field) => {
                const val = sectorFields[field.key];
                if (!val) return null;
                return (
                  <div key={field.key}>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {field.label}
                    </dt>
                    <dd className="text-sm text-gray-900 mt-1">{val}</dd>
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

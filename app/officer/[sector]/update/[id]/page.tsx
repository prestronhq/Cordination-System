import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getSectorConfig } from "@/lib/sectors";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UpdateDetailPage({
  params,
}: {
  params: Promise<{ sector: string; id: string }>;
}) {
  const { sector, id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const update = await prisma.update.findUnique({
    where: { id },
    include: { sector: true },
  });

  if (!update || update.sector.key !== sector || update.submittedById !== user.id) {
    notFound();
  }

  const sectorConfig = getSectorConfig(sector);
  const sectorFields = JSON.parse(update.sectorFields || "{}");

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/officer/${sector}`}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to my updates
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{update.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={update.status} />
              <PriorityBadge priority={update.priority} />
              <span className="text-sm text-gray-500">
                Submitted {formatDateTime(update.submittedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Needs correction / rejected alert */}
      {(update.status === "needs_correction" || update.status === "rejected") &&
        update.reviewComment && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm mb-1">
                {update.status === "needs_correction"
                  ? "Correction Required"
                  : "Update Rejected"}
              </p>
              <p className="text-amber-700 text-sm">{update.reviewComment}</p>
              {update.reviewedAt && (
                <p className="text-amber-600 text-xs mt-1">
                  Reviewed {formatDateTime(update.reviewedAt)}
                </p>
              )}
            </div>
          </div>
        )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {update.description}
              </p>
            </CardContent>
          </Card>

          {sectorConfig && Object.keys(sectorFields).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {sectorConfig.name}-Specific Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sectorConfig.fields.map((field) => {
                    const val = sectorFields[field.key];
                    if (!val) return null;
                    return (
                      <div key={field.key}>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {field.label}
                        </dt>
                        <dd className="text-sm text-gray-900 mt-0.5">{val}</dd>
                      </div>
                    );
                  })}
                </dl>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Location</div>
                <div className="text-sm text-gray-900">{update.location}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Sector</div>
                <div className="text-sm text-gray-900 flex items-center gap-1">
                  <span>{sectorConfig?.icon}</span>
                  <span>{update.sector.name}</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</div>
                <StatusBadge status={update.status} />
              </div>
              {update.status === "approved" && update.publishedAt && (
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Published</div>
                  <div className="text-sm text-green-700">{formatDateTime(update.publishedAt)}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {update.status === "needs_correction" && (
            <Button asChild className="w-full">
              <Link href={`/officer/${sector}/submit?resubmit=${update.id}`}>
                Submit Corrected Update
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

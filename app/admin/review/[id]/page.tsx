import { SectorIcon } from "@/components/SectorIcon";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSectorConfig } from "@/lib/sectors";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "@/lib/icons";
import { formatDateTime } from "@/lib/utils";
import { ReviewActions } from "./ReviewActions";
import { DEMO_USERS } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const update = await prisma.update.findUnique({
    where: { id },
    include: { sector: true },
  });

  if (!update) notFound();

  const sectorConfig = getSectorConfig(update.sector.key);
  const sectorFields = JSON.parse(update.sectorFields || "{}");

  const submittedBy = DEMO_USERS.find((u) => u.id === update.submittedById);
  const reviewedBy = update.reviewedById
    ? DEMO_USERS.find((u) => u.id === update.reviewedById)
    : null;

  const canReview = update.status === "pending" || update.status === "needs_correction";

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/review"
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text-strong mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Review Queue
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-text-strong mb-2">{update.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl">{update.sector.icon}</span>
              <StatusBadge status={update.status} />
              <PriorityBadge priority={update.priority} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-default leading-relaxed whitespace-pre-wrap">
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
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sectorConfig.fields.map((field) => {
                    const val = sectorFields[field.key];
                    if (!val) return null;
                    return (
                      <div key={field.key}>
                        <dt className="text-xs font-medium text-text-muted uppercase tracking-wide">
                          {field.label}
                        </dt>
                        <dd className="text-sm text-text-strong mt-1">{val}</dd>
                      </div>
                    );
                  })}
                </dl>
              </CardContent>
            </Card>
          )}

          {/* Audit trail */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-text-strong">Submitted</span>
                    <span className="text-text-muted"> by {submittedBy?.name ?? update.submittedById}</span>
                    <div className="text-xs text-text-subtle">{formatDateTime(update.submittedAt)}</div>
                  </div>
                </div>

                {update.reviewedAt && reviewedBy && (
                  <div className="flex items-start gap-3 text-sm">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        update.status === "approved"
                          ? "bg-secondary-500"
                          : update.status === "rejected"
                          ? "bg-error-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <div>
                      <span className="font-medium text-text-strong">
                        {update.status === "approved"
                          ? "Approved"
                          : update.status === "rejected"
                          ? "Rejected"
                          : "Correction requested"}
                      </span>
                      <span className="text-text-muted"> by {reviewedBy.name}</span>
                      <div className="text-xs text-text-subtle">
                        {formatDateTime(update.reviewedAt)}
                      </div>
                      {update.reviewComment && (
                        <div className="mt-1 text-sm text-text-muted bg-surface-1 rounded p-2">
                          {update.reviewComment}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {update.publishedAt && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-text-strong">Published to public bulletin</span>
                      <div className="text-xs text-text-subtle">{formatDateTime(update.publishedAt)}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Sector</div>
                <div className="flex items-center gap-1.5">
                  <SectorIcon iconKey={update.sector.icon} className="size-4 p-0 bg-transparent text-current" />
                  <span className="text-text-strong">{update.sector.name}</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Location</div>
                <div className="text-text-strong">{update.location}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Priority</div>
                <PriorityBadge priority={update.priority} />
              </div>
              <div>
                <div className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Status</div>
                <StatusBadge status={update.status} />
              </div>
              <div>
                <div className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Submitted By</div>
                <div className="text-text-strong">{submittedBy?.name ?? update.submittedById}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Submitted At</div>
                <div className="text-text-strong">{formatDateTime(update.submittedAt)}</div>
              </div>
            </CardContent>
          </Card>

          {canReview && <ReviewActions updateId={update.id} />}

          {!canReview && update.status === "approved" && update.publishedAt && (
            <Card className="bg-secondary-50 border-secondary-200">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-secondary-800 mb-1">Published</p>
                <p className="text-xs text-secondary-700">
                  This update is live on the public bulletin.
                </p>
                <Link
                  href={`/bulletin/${update.id}`}
                  className="text-xs text-secondary-700 underline mt-2 block"
                  target="_blank"
                >
                  View on public bulletin →
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { ACTIVE_SECTORS } from "@/lib/sectors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportExporter } from "./ReportExporter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Period = "monthly" | "quarterly" | "annual";

function getPeriodRange(period: Period, date: Date): { start: Date; end: Date; label: string } {
  const y = date.getFullYear();
  const m = date.getMonth();

  if (period === "annual") {
    return {
      start: new Date(y, 0, 1),
      end: new Date(y, 11, 31, 23, 59, 59),
      label: `Year ${y}`,
    };
  }
  if (period === "quarterly") {
    const q = Math.floor(m / 3);
    return {
      start: new Date(y, q * 3, 1),
      end: new Date(y, q * 3 + 3, 0, 23, 59, 59),
      label: `Q${q + 1} ${y}`,
    };
  }
  return {
    start: new Date(y, m, 1),
    end: new Date(y, m + 1, 0, 23, 59, 59),
    label: new Date(y, m, 1).toLocaleDateString("en-UG", { month: "long", year: "numeric" }),
  };
}

async function getReportData(period: Period) {
  const range = getPeriodRange(period, new Date());

  const updates = await prisma.update.findMany({
    where: {
      submittedAt: { gte: range.start, lte: range.end },
    },
    include: { sector: true },
  });

  // Aggregate by sector
  const sectorStats: Record<
    string,
    {
      sectorKey: string;
      sectorName: string;
      sectorIcon: string;
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      needs_correction: number;
      avgApprovalHours: number | null;
    }
  > = {};

  for (const s of ACTIVE_SECTORS) {
    sectorStats[s.key] = {
      sectorKey: s.key,
      sectorName: s.name,
      sectorIcon: s.icon,
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      needs_correction: 0,
      avgApprovalHours: null,
    };
  }

  for (const u of updates) {
    const sk = u.sector.key;
    if (!sectorStats[sk]) continue;
    sectorStats[sk].total++;
    if (u.status === "pending") sectorStats[sk].pending++;
    else if (u.status === "approved") sectorStats[sk].approved++;
    else if (u.status === "rejected") sectorStats[sk].rejected++;
    else if (u.status === "needs_correction") sectorStats[sk].needs_correction++;
  }

  // Calc avg approval time per sector
  for (const s of ACTIVE_SECTORS) {
    const approved = updates.filter(
      (u) => u.sector.key === s.key && u.status === "approved" && u.reviewedAt
    );
    if (approved.length === 0) continue;
    const totalHours = approved.reduce((sum, u) => {
      const diff = (u.reviewedAt!.getTime() - u.submittedAt.getTime()) / 3600000;
      return sum + diff;
    }, 0);
    sectorStats[s.key].avgApprovalHours = Math.round(totalHours / approved.length);
  }

  const totals = {
    total: updates.length,
    pending: updates.filter((u) => u.status === "pending").length,
    approved: updates.filter((u) => u.status === "approved").length,
    rejected: updates.filter((u) => u.status === "rejected").length,
  };

  return {
    range,
    sectorStats: Object.values(sectorStats),
    totals,
  };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const sp = await searchParams;
  const period = (sp.period as Period) ?? "monthly";
  const { range, sectorStats, totals } = await getReportData(period);

  const periodLinks: { label: string; value: Period }[] = [
    { label: "Monthly", value: "monthly" },
    { label: "Quarterly", value: "quarterly" },
    { label: "Annual", value: "annual" },
  ];

  return (
    <div>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-strong">Reports</h1>
          <p className="text-text-muted text-sm mt-1">{range.label}</p>
        </div>
        <ReportExporter period={period} label={range.label} sectorStats={sectorStats} totals={totals} />
      </div>

      {/* Period selector */}
      <div className="flex gap-2 mb-6">
        {periodLinks.map((p) => (
          <a
            key={p.value}
            href={`/admin/reports?period=${p.value}`}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              period === p.value
                ? "bg-primary-600 text-white border-primary-600"
                : "bg-white text-text-default border-border-strong hover:border-blue-400"
            }`}
          >
            {p.label}
          </a>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-text-strong">{totals.total}</div>
            <div className="text-xs text-text-muted mt-1">Total Submissions</div>
          </CardContent>
        </Card>
        <Card className="bg-secondary-50 border-secondary-200">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-secondary-800">{totals.approved}</div>
            <div className="text-xs text-green-600 mt-1">Approved</div>
          </CardContent>
        </Card>
        <Card className="bg-warning-50 border-warning-200">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-warning-800">{totals.pending}</div>
            <div className="text-xs text-yellow-600 mt-1">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-error-50 border-error-200">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-error-800">{totals.rejected}</div>
            <div className="text-xs text-red-600 mt-1">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Sector breakdown table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sector Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default bg-surface-1">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">
                    Sector
                  </th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">
                    Total
                  </th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">
                    Approved
                  </th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">
                    Pending
                  </th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">
                    Rejected
                  </th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">
                    Avg. Approval
                  </th>
                </tr>
              </thead>
              <tbody>
                {sectorStats.map((row, i) => (
                  <tr
                    key={row.sectorKey}
                    className={`border-b border-gray-100 ${i % 2 === 0 ? "" : "bg-surface-1/50"}`}
                  >
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <span>{row.sectorIcon}</span>
                        <span className="font-medium text-text-strong">{row.sectorName}</span>
                      </span>
                    </td>
                    <td className="text-center px-3 py-3 font-semibold text-text-strong">
                      {row.total}
                    </td>
                    <td className="text-center px-3 py-3 text-secondary-700 font-medium">
                      {row.approved}
                    </td>
                    <td className="text-center px-3 py-3 text-warning-700">
                      {row.pending}
                    </td>
                    <td className="text-center px-3 py-3 text-error-700">
                      {row.rejected}
                    </td>
                    <td className="text-center px-3 py-3 text-text-muted">
                      {row.avgApprovalHours !== null
                        ? row.avgApprovalHours < 24
                          ? `${row.avgApprovalHours}h`
                          : `${Math.round(row.avgApprovalHours / 24)}d`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

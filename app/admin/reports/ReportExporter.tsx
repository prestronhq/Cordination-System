"use client";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet } from "lucide-react";

interface SectorStat {
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

interface Props {
  period: string;
  label: string;
  sectorStats: SectorStat[];
  totals: { total: number; pending: number; approved: number; rejected: number };
}

export function ReportExporter({ period, label, sectorStats, totals }: Props) {
  async function exportPDF() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 95);
    doc.text("Lira District Sector Coordination Platform", 14, 20);
    doc.setFontSize(13);
    doc.setTextColor(60, 60, 60);
    doc.text(`Sector Performance Report — ${label}`, 14, 30);
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated: ${new Date().toLocaleString("en-UG")}`, 14, 38);

    // Summary
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 95);
    doc.text("Summary", 14, 50);
    autoTable(doc, {
      startY: 54,
      head: [["Total", "Approved", "Pending", "Rejected"]],
      body: [[totals.total, totals.approved, totals.pending, totals.rejected]],
      theme: "grid",
      headStyles: { fillColor: [30, 58, 95] },
    });

    // Sector breakdown
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 95);
    doc.text("Sector Breakdown", 14, finalY);

    autoTable(doc, {
      startY: finalY + 4,
      head: [["Sector", "Total", "Approved", "Pending", "Rejected", "Avg Approval"]],
      body: sectorStats.map((r) => [
        r.sectorName,
        r.total,
        r.approved,
        r.pending,
        r.rejected,
        r.avgApprovalHours !== null
          ? r.avgApprovalHours < 24
            ? `${r.avgApprovalHours}h`
            : `${Math.round(r.avgApprovalHours / 24)}d`
          : "—",
      ]),
      theme: "striped",
      headStyles: { fillColor: [45, 106, 79] },
    });

    doc.save(`lira-report-${period}-${Date.now()}.pdf`);
  }

  async function exportExcel() {
    const XLSX = await import("xlsx");

    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ["Lira District Sector Coordination Platform"],
      [`Report Period: ${label}`],
      [`Generated: ${new Date().toLocaleString("en-UG")}`],
      [],
      ["Summary"],
      ["Total Submissions", "Approved", "Pending", "Rejected"],
      [totals.total, totals.approved, totals.pending, totals.rejected],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, "Summary");

    // Sector details sheet
    const sectorData = [
      ["Sector", "Total", "Approved", "Pending", "Rejected", "Avg Approval (hours)"],
      ...sectorStats.map((r) => [
        r.sectorName,
        r.total,
        r.approved,
        r.pending,
        r.rejected,
        r.avgApprovalHours ?? "N/A",
      ]),
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(sectorData);
    XLSX.utils.book_append_sheet(wb, ws2, "Sector Performance");

    XLSX.writeFile(wb, `lira-report-${period}-${Date.now()}.xlsx`);
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={exportPDF} className="gap-1.5">
        <FileDown className="w-4 h-4" />
        Export PDF
      </Button>
      <Button variant="outline" onClick={exportExcel} className="gap-1.5">
        <FileSpreadsheet className="w-4 h-4" />
        Export Excel
      </Button>
    </div>
  );
}
